'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Salus IT500 API Client
 */
class SalusAPI {
	/**
	 * @param {string} username - Email address for Salus IT500 account
	 * @param {string} password - Password for Salus IT500 account
	 * @param {object} logger - Logger object with methods: info, warn, error, debug
	 */
	constructor(username, password, logger) {
		this.username = username;
		this.password = password;
		this.logger = logger || console;
		this.token = null;
		this.devId = null;
		this.cookies = [];

		// Create axios instance
		this.client = axios.create({
			timeout: 10000,
			headers: {
				'User-Agent': 'ioBroker Salus IT500 Adapter',
			},
		});

		// Add interceptor to handle cookies
		this.client.interceptors.response.use(response => {
			const setCookie = response.headers['set-cookie'];
			if (setCookie) {
				this.cookies = setCookie;
			}
			return response;
		});

		this.client.interceptors.request.use(config => {
			if (this.cookies.length > 0) {
				config.headers['Cookie'] = this.cookies.join('; ');
			}
			return config;
		});
	}

	/**
	 * Login to Salus IT500 and retrieve token and device ID
	 *
	 * @returns {Promise<{token: string, devId: string}>} Login response with token and device ID
	 */
	async login() {
		try {
			this.logger.debug('Attempting to login to Salus IT500...');

			// Login request
			await this.client.post(
				'https://salus-it500.com/public/login.php',
				new URLSearchParams({
					IDemail: this.username,
					password: this.password,
					login: 'Login',
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			this.logger.debug('Login successful, fetching device information...');

			// Get devices page
			const devicesResponse = await this.client.get('https://salus-it500.com/public/devices.php');
			const $ = cheerio.load(devicesResponse.data);

			// Extract token and device ID
			this.token = $('#token').attr('value');
			this.devId = $('input[name="devId"]').attr('value');

			if (!this.token || !this.devId) {
				throw new Error('Failed to retrieve token or device ID. Please check credentials.');
			}

			this.logger.info(`Logged in successfully. Device ID: ${this.devId}`);

			return {
				token: this.token,
				devId: this.devId,
			};
		} catch (error) {
			this.logger.error(`Login failed: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Get current device status
	 *
	 * @returns {Promise<object>} Device status object with temperature and heating information
	 */
	async getStatus() {
		if (!this.token || !this.devId) {
			await this.login();
		}

		try {
			const endpoint = `https://salus-it500.com/public/ajax_device_values.php?devId=${this.devId}&token=${this.token}`;
			const response = await this.client.get(endpoint);
			const data = response.data;

			// Check if frost protection mode is active
			if (data.frost === 32) {
				this.logger.warn('Device is in frost protection mode');
				throw new Error('Device is in frost protection mode');
			}

			return {
				currentTemp: parseFloat(data.CH1currentRoomTemp),
				setTemp: parseFloat(data.CH1currentSetPoint),
				autoMode: parseInt(data.CH1autoMode) === 0,
				heatStatus: parseInt(data.CH1heatOnOffStatus),
				rawData: data,
			};
		} catch (error) {
			// If unauthorized, try to login again
			if (error.response && error.response.status === 401) {
				this.logger.warn('Token expired, attempting to re-login...');
				await this.login();
				return this.getStatus();
			}
			this.logger.error(`Failed to get status: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Set target temperature
	 *
	 * @param {number} temperature - Target temperature
	 * @returns {Promise<object>} API response confirming temperature change
	 */
	async setTemperature(temperature) {
		if (!this.token || !this.devId) {
			await this.login();
		}

		try {
			const response = await this.client.post(
				'https://salus-it500.com/includes/set.php',
				new URLSearchParams({
					token: this.token || '',
					tempUnit: '0',
					devId: this.devId || '',
					current_tempZ1_set: '1',
					current_tempZ1: temperature.toString(),
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			const data = response.data;

			if (data.errorMsg) {
				throw new Error(data.errorMsg);
			}

			this.logger.info(`Temperature set to ${temperature}°C`);
			return data;
		} catch (error) {
			// If unauthorized, try to login again
			if (error.response && error.response.status === 401) {
				this.logger.warn('Token expired, attempting to re-login...');
				await this.login();
				return this.setTemperature(temperature);
			}
			this.logger.error(`Failed to set temperature: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Set auto mode
	 *
	 * @param {boolean} autoMode - true for AUTO mode, false for OFF mode
	 * @returns {Promise<object>} API response confirming auto mode change
	 */
	async setAutoMode(autoMode) {
		if (!this.token || !this.devId) {
			await this.login();
		}

		try {
			const desiredState = autoMode ? 0 : 1;

			const response = await this.client.post(
				'https://salus-it500.com/includes/set.php',
				new URLSearchParams({
					token: this.token || '',
					devId: this.devId || '',
					auto: desiredState.toString(),
					auto_setZ1: '1',
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			const data = response.data;

			if (data.errorMsg) {
				throw new Error(data.errorMsg);
			}

			this.logger.info(`Auto mode set to ${autoMode ? 'AUTO' : 'OFF'}`);
			return data;
		} catch (error) {
			// If unauthorized, try to login again
			if (error.response && error.response.status === 401) {
				this.logger.warn('Token expired, attempting to re-login...');
				await this.login();
				return this.setAutoMode(autoMode);
			}
			this.logger.error(`Failed to set auto mode: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Get heat status
	 *
	 * @returns {Promise<number>} Current heating status (1 = heating active, 0 = heating off)
	 */
	async getHeatStatus() {
		const status = await this.getStatus();
		return status.heatStatus;
	}
}

module.exports = SalusAPI;
