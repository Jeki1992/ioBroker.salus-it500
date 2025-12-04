'use strict';

/*
 * Created with @iobroker/create-adapter v3.1.2
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const SalusAPI = require('./lib/salus-api');

class SalusIt500 extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options] - Adapter options
	 */
	constructor(options) {
		super({
			...options,
			name: 'salus-it500',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('unload', this.onUnload.bind(this));

		this.api = null;
		this.pollInterval = null;
		this.isUpdating = false;
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.log.info('Starting Salus IT500 adapter');

		// Check configuration
		if (!this.config.username || !this.config.password) {
			this.log.error('Username and password are required. Please configure the adapter.');
			return;
		}

		// Initialize API
		this.api = new SalusAPI(this.config.username, this.config.password, this.log);

		try {
			// Login and get device information
			await this.api.login();

			// Create states
			await this.createStates();

			// Subscribe to writable states
			this.subscribeStates('setTemp');
			this.subscribeStates('autoMode');

			// Start polling
			await this.updateDeviceStatus();
			const pollInterval = Math.max(30, this.config.pollInterval || 60) * 1000;
			this.pollInterval = setInterval(() => {
				this.updateDeviceStatus();
			}, pollInterval);

			this.log.info(`Adapter started successfully. Polling every ${pollInterval / 1000} seconds.`);
		} catch (error) {
			this.log.error(`Failed to initialize adapter: ${error.message}`);
		}
	}

	/**
	 * Create all necessary states
	 */
	async createStates() {
		// Connection state
		await this.setObjectNotExistsAsync('info.connection', {
			type: 'state',
			common: {
				name: 'Device connection',
				type: 'boolean',
				role: 'indicator.connected',
				read: true,
				write: false,
			},
			native: {},
		});

		// Current temperature
		await this.setObjectNotExistsAsync('currentTemp', {
			type: 'state',
			common: {
				name: 'Current room temperature',
				type: 'number',
				role: 'value.temperature',
				read: true,
				write: false,
				unit: '°C',
			},
			native: {},
		});

		// Set temperature
		await this.setObjectNotExistsAsync('setTemp', {
			type: 'state',
			common: {
				name: 'Target temperature',
				type: 'number',
				role: 'level.temperature',
				read: true,
				write: true,
				unit: '°C',
				min: 5,
				max: 35,
			},
			native: {},
		});

		// Auto mode
		await this.setObjectNotExistsAsync('autoMode', {
			type: 'state',
			common: {
				name: 'Auto mode',
				type: 'boolean',
				role: 'switch',
				read: true,
				write: true,
				states: {
					true: 'AUTO',
					false: 'OFF',
				},
			},
			native: {},
		});

		// Heat status
		await this.setObjectNotExistsAsync('heatStatus', {
			type: 'state',
			common: {
				name: 'Heating status',
				type: 'boolean',
				role: 'indicator.working',
				read: true,
				write: false,
				states: {
					true: 'Heating',
					false: 'Off',
				},
			},
			native: {},
		});

		// Device ID (info)
		await this.setObjectNotExistsAsync('info.deviceId', {
			type: 'state',
			common: {
				name: 'Device ID',
				type: 'string',
				role: 'info.name',
				read: true,
				write: false,
			},
			native: {},
		});
	}

	/**
	 * Update device status from API
	 */
	async updateDeviceStatus() {
		if (this.isUpdating) {
			this.log.debug('Update already in progress, skipping...');
			return;
		}

		this.isUpdating = true;

		try {
			if (!this.api) {
				throw new Error('API not initialized');
			}

			const status = await this.api.getStatus();

			// Update states
			await this.setState('currentTemp', { val: status.currentTemp, ack: true });
			await this.setState('setTemp', { val: status.setTemp, ack: true });
			await this.setState('autoMode', { val: status.autoMode, ack: true });
			await this.setState('heatStatus', { val: status.heatStatus === 1, ack: true });
			await this.setState('info.connection', { val: true, ack: true });
			await this.setState('info.deviceId', { val: this.api.devId || '', ack: true });

			this.log.debug(
				`Status updated - Current: ${status.currentTemp}°C, Set: ${status.setTemp}°C, ` +
					`Auto: ${status.autoMode}, Heat: ${status.heatStatus === 1}`,
			);
		} catch (error) {
			this.log.error(`Failed to update device status: ${error.message}`);
			await this.setState('info.connection', { val: false, ack: true });
		} finally {
			this.isUpdating = false;
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 *
	 * @param {() => void} callback - Callback function
	 */
	onUnload(callback) {
		try {
			// Clear polling interval
			if (this.pollInterval) {
				clearInterval(this.pollInterval);
				this.pollInterval = null;
			}

			this.log.info('Adapter stopped');
			callback();
		} catch (error) {
			this.log.error(`Error during unloading: ${error.message}`);
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 *
	 * @param {string} id - State ID
	 * @param {ioBroker.State | null | undefined} state - State object
	 */
	async onStateChange(id, state) {
		if (!state || state.ack) {
			// Ignore acknowledged states or deleted states
			return;
		}

		// Extract the state name from the id
		const stateName = id.split('.').pop();

		try {
			if (!this.api) {
				throw new Error('API not initialized');
			}

			this.log.info(`User command received for ${stateName}: ${state.val}`);

			switch (stateName) {
				case 'setTemp':
					// Set temperature
					if (typeof state.val === 'number') {
						await this.api.setTemperature(state.val);
						await this.setState('setTemp', { val: state.val, ack: true });
						// Update status after a short delay
						setTimeout(() => this.updateDeviceStatus(), 2000);
					}
					break;

				case 'autoMode':
					// Set auto mode
					if (typeof state.val === 'boolean') {
						await this.api.setAutoMode(state.val);
						await this.setState('autoMode', { val: state.val, ack: true });
						// Update status after a short delay
						setTimeout(() => this.updateDeviceStatus(), 2000);
					}
					break;

				default:
					this.log.warn(`Unknown state change: ${stateName}`);
			}
		} catch (error) {
			this.log.error(`Failed to process state change for ${stateName}: ${error.message}`);
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options] - Adapter options
	 */
	module.exports = options => new SalusIt500(options);
} else {
	// otherwise start the instance directly
	new SalusIt500();
}
