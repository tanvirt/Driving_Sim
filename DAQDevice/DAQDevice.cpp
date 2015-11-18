#include "DAQDevice.h"

DAQDevice::DAQDevice() {
	numSamples = 1000;
	data = new double[numSamples];
	taskHandle = 0;
	numSamplesReadPerChannel = 0;
}

DAQDevice::~DAQDevice() {
	delete [] data;
}

void DAQDevice::setNumSamples(signed long numSamples) {
	this->numSamples = numSamples;
	delete [] data;
	data = new double[numSamples];
}

double* DAQDevice::getData() {
	return data;
}

signed long DAQDevice::getNumSamplesReadPerChannel() {
	return numSamplesReadPerChannel;
}

void DAQDevice::loadTask(const char * task) {
	signed long error = DAQmxLoadTask(task, &taskHandle);
	if(isError(error))
		throw new DAQException(error);
}

void DAQDevice::startTask() {
	signed long error = DAQmxStartTask(taskHandle);
	if(isError(error))
		throw new DAQException(error);
}

void DAQDevice::stopTask() {
	DAQmxStopTask(taskHandle);
}

void DAQDevice::clearTask() {
	DAQmxClearTask(taskHandle);
}

bool DAQDevice::taskIsLoaded() {
	return taskHandle != 0;
}

bool DAQDevice::taskIsDone() {
	unsigned long isTaskDone = FALSE;
	signed long error = DAQmxIsTaskDone(taskHandle, &isTaskDone);

	if(isError(error))
		throw new DAQException(error);

	if(isTaskDone)
		return true;
	return false;
}

void DAQDevice::readAnalogData(double timeout, FillMode fillMode) {
	unsigned long mode;
	if(fillMode == GroupByChannel)
		mode = 0;
	else if(fillMode == GroupByScanNumber)
		mode = 1;

	DAQmxReadAnalogF64(taskHandle, this->numSamples, timeout,
			mode, data, this->numSamples, &numSamplesReadPerChannel, NULL);
}

void DAQDevice::handleError(signed long error) {
	if(taskIsLoaded()) {
		stopTask();
		clearTask();
	}
	if(isError(error))
		std::cout << "DAQmx Error: " << getErrorInfo(error) << std::endl;
}

std::string DAQDevice::getErrorInfo(signed long error) {
	char errorBuffer[2048] = {'\0'};
	if(isError(error))
		DAQmxGetExtendedErrorInfo(errorBuffer, 2048);
	std::string errorString(errorBuffer);

	return errorString;
}

bool DAQDevice::isError(signed long error) {
	return DAQmxFailed(error);
}
