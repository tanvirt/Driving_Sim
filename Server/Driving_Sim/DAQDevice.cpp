#include "NIDAQmx.h"
#include "DAQDevice.h"
#include "DAQException.h"

DAQDevice::DAQDevice() {}

DAQDevice::~DAQDevice() {
	delete [] data;
}

void DAQDevice::setNumSamplesPerChannel(signed long numSamples) {
	this->numSamples = numSamples*getNumChannels();
	delete [] data;
	data = new double[this->numSamples];
}

double* DAQDevice::getData() {
	return data;
}

signed long DAQDevice::getNumSamplesReadPerChannel() {
	return numSamplesReadPerChannel;
}

unsigned long DAQDevice::getNumChannels() {
	if(task != 0) {
		unsigned long numChannels;
		DAQmxGetTaskNumChans(task, &numChannels);
		return numChannels;
	}
	return 0;
}

void DAQDevice::createAIVoltageChannel(const char* channel) {
	long error = DAQmxCreateAIVoltageChan(
		task,
		channel,
		"",
		DAQmx_Val_Cfg_Default,
		-10.0,
		10.0,
		DAQmx_Val_Volts,
		NULL
	);
	if(isError(error))
		throw new DAQException(error);

}

void DAQDevice::createTask(const char* taskName) {
	long error = DAQmxCreateTask(taskName, &task);
	if(isError(error))
		throw new DAQException(error);
}

void DAQDevice::loadTask(const char* taskName) {
	long error = DAQmxLoadTask(taskName, &task);
	if(isError(error))
		throw new DAQException(error);
}

void DAQDevice::startTask() {
	long error = DAQmxStartTask(task);
	if(isError(error))
		throw new DAQException(error);
}

void DAQDevice::stopTask() {
	DAQmxStopTask(task);
}

void DAQDevice::clearTask() {
	DAQmxClearTask(task);
}

bool DAQDevice::taskIsLoaded() {
	return task != 0;
}

bool DAQDevice::taskIsDone() {
	unsigned long isTaskDone = FALSE;
	long error = DAQmxIsTaskDone(task, &isTaskDone);

	if(isError(error))
		throw new DAQException(error);

	if(isTaskDone)
		return true;
	return false;
}

void DAQDevice::readAnalogData(double timeout, FillMode fillMode) {
	DAQmxReadAnalogF64(task, numSamples/getNumChannels(), timeout, fillMode, data,
			numSamples, &numSamplesReadPerChannel, NULL);

	for(unsigned int i = 0; i < listeners->size(); i++)
		listeners->at(i)->onDataAquired();
}

void DAQDevice::handleError(long error) {
	if(taskIsLoaded()) {
		stopTask();
		clearTask();
	}
	if(isError(error))
		std::cout << "DAQmx Error: " << getErrorInfo(error) << std::endl;
}

std::string DAQDevice::getErrorInfo(long error) {
	char errorBuffer[2048] = {'\0'};
	if(isError(error))
		DAQmxGetExtendedErrorInfo(errorBuffer, 2048);
	std::string errorString(errorBuffer);

	return errorString;
}

bool DAQDevice::isError(long error) {
	return DAQmxFailed(error);
}

void DAQDevice::addListener(DAQDeviceListener* listener) {
	listeners->push_back(listener);
}
