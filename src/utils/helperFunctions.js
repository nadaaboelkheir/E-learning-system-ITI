module.exports = {
	deviceLimit: 10,
	activeDeviceLimit: 10,
	setTemporaryData,
	getTemporaryData,
	clearTemporaryData,
};

const temporaryStorage = {};
function setTemporaryData(key, value) {
	temporaryStorage[key] = { value, expiry: Date.now() + 3600000 };
}

function getTemporaryData(key) {
	const data = temporaryStorage[key];
	if (data && data.expiry > Date.now()) {
		return data.value;
	}
	delete temporaryStorage[key];
	return null;
}

function clearTemporaryData(key) {
	delete temporaryStorage[key];
}
