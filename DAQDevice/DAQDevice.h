#ifndef DAQDEVICE_H_
#define DAQDEVICE_H_

#include <iostream>
#include <vector>
#include "DAQDeviceListener.h"

class DAQDevice {

public:
	DAQDevice();
	virtual ~DAQDevice();

private:
	long numSamples = 1000;
	double* data = new double[numSamples];
	unsigned long task = 0;
	long numSamplesReadPerChannel = 0;
	std::vector<DAQDeviceListener*>* listeners = new std::vector<DAQDeviceListener*>();

public:
	enum FillMode { GroupByChannel, GroupByScanNumber };

	void setNumSamples(signed long numSamples);

	double* getData();
	signed long getNumSamplesReadPerChannel();

	void loadTask(const char* taskName);
	void startTask();
	bool taskIsDone();

	void readAnalogData(double timeout, FillMode fillMode);

	void handleError(long error);

	void addListener(DAQDeviceListener* listener);

private:
	unsigned long getNumChannels();

	void stopTask();
	void clearTask();
	bool taskIsLoaded();

	bool isError(long error);
	std::string getErrorInfo(long error);

};

#endif /* DAQDEVICE_H_ */
