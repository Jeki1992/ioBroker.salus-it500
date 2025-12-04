![Logo](admin/salus-it500.png)
# ioBroker.salus-it500

[![NPM version](https://img.shields.io/npm/v/iobroker.salus-it500.svg)](https://www.npmjs.com/package/iobroker.salus-it500)
[![Downloads](https://img.shields.io/npm/dm/iobroker.salus-it500.svg)](https://www.npmjs.com/package/iobroker.salus-it500)
![Number of Installations](https://iobroker.live/badges/salus-it500-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/salus-it500-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.salus-it500.png?downloads=true)](https://nodei.co/npm/iobroker.salus-it500/)

**Tests:** ![Test and Release](https://github.com/Jeki1992/ioBroker.salus-it500/workflows/Test%20and%20Release/badge.svg)

## Salus IT500 adapter for ioBroker

This adapter allows you to control and monitor your Salus IT500 thermostat through ioBroker.

## Features

- Read current room temperature
- Read and set target temperature
- Read heating status (on/off)
- Switch between AUTO and OFF modes
- Automatic polling of device status
- Session management with automatic re-login

## Configuration

1. Install the adapter from the ioBroker admin interface
2. Configure the adapter with your Salus IT500 credentials:
   - **Username/Email**: Your Salus IT500 account email
   - **Password**: Your Salus IT500 account password
   - **Poll interval**: How often to update device data (minimum 30 seconds, default 60 seconds)

## States

The adapter creates the following states:

### Control States
- `salus-it500.0.setTemp` - Target temperature (read/write, °C)
- `salus-it500.0.autoMode` - Auto mode switch (read/write, true=AUTO, false=OFF)

### Status States
- `salus-it500.0.currentTemp` - Current room temperature (read-only, °C)
- `salus-it500.0.heatStatus` - Heating status (read-only, true=heating, false=off)

### Information States
- `salus-it500.0.info.connection` - Connection status (read-only)
- `salus-it500.0.info.deviceId` - Device ID (read-only)

## Usage Examples

### Set target temperature
```javascript
setState('salus-it500.0.setTemp', 22);
```

### Enable AUTO mode
```javascript
setState('salus-it500.0.autoMode', true);
```

### Disable AUTO mode (manual control)
```javascript
setState('salus-it500.0.autoMode', false);
```

### Read current temperature
```javascript
const currentTemp = getState('salus-it500.0.currentTemp').val;
console.log(`Current temperature: ${currentTemp}°C`);
```

## Credits

This adapter is based on the [node-red-contrib-salus-it500](https://github.com/justmvg/node-red-contrib-salus-it500) library by JustMVG.

## Changelog

### 0.0.1 (2025-12-04)
- Initial release
- Support for reading current temperature
- Support for setting target temperature
- Support for AUTO/OFF mode switching
- Automatic polling with configurable interval
- Session management with automatic re-login

## License
MIT License

Copyright (c) 2025 Alex <o.zaiets@ukr.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


### State Roles
When creating state objects, it is important to use the correct role for the state. The role defines how the state should be interpreted by visualizations and other adapters. For a list of available roles and their meanings, please refer to the [state roles documentation](https://www.iobroker.net/#en/documentation/dev/stateroles.md).

**Important:** Do not invent your own custom role names. If you need a role that is not part of the official list, please contact the ioBroker developer community for guidance and discussion about adding new roles.

### Scripts in `package.json`
Several npm scripts are predefined for your convenience. You can run them using `npm run <scriptname>`
| Script name | Description |
|-------------|-------------|
| `test:js` | Executes the tests you defined in `*.test.js` files. |
| `test:package` | Ensures your `package.json` and `io-package.json` are valid. |
| `test:integration` | Tests the adapter startup with an actual instance of ioBroker. |
| `test` | Performs a minimal test run on package files and your tests. |
| `check` | Performs a type-check on your code (without compiling anything). |
| `lint` | Runs `ESLint` to check your code for formatting errors and potential bugs. |
| `translate` | Translates texts in your adapter to all required languages, see [`@iobroker/adapter-dev`](https://github.com/ioBroker/adapter-dev#manage-translations) for more details. |
| `release` | Creates a new release, see [`@alcalzone/release-script`](https://github.com/AlCalzone/release-script#usage) for more details. |

### Writing tests
When done right, testing code is invaluable, because it gives you the 
confidence to change your code while knowing exactly if and when 
something breaks. A good read on the topic of test-driven development 
is https://hackernoon.com/introduction-to-test-driven-development-tdd-61a13bc92d92. 
Although writing tests before the code might seem strange at first, but it has very 
clear upsides.

The template provides you with basic tests for the adapter startup and package files.
It is recommended that you add your own tests into the mix.

### Publishing the adapter
Using GitHub Actions, you can enable automatic releases on npm whenever you push a new git tag that matches the form 
`v<major>.<minor>.<patch>`. We **strongly recommend** that you do. The necessary steps are described in `.github/workflows/test-and-release.yml`.

Since you installed the release script, you can create a new
release simply by calling:
```bash
npm run release
```
Additional command line options for the release script are explained in the
[release-script documentation](https://github.com/AlCalzone/release-script#command-line).

To get your adapter released in ioBroker, please refer to the documentation 
of [ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories#requirements-for-adapter-to-get-added-to-the-latest-repository).

### Test the adapter manually with dev-server
Since you set up `dev-server`, you can use it to run, test and debug your adapter.

You may start `dev-server` by calling from your dev directory:
```bash
dev-server watch
```

The ioBroker.admin interface will then be available at http://localhost:undefined/

Please refer to the [`dev-server` documentation](https://github.com/ioBroker/dev-server#command-line) for more details.

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**
* (Alex) initial release

## License
MIT License

Copyright (c) 2025 Alex <o.zaiets@ukr.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
