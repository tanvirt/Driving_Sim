#ifndef DAQDEVICE_H_
#define DAQDEVICE_H_

#include <iostream>
#include <vector>
#include "DAQDeviceListener.h"

class DAQDevice {

public:
	enum FillMode { GroupByChannel, GroupByScanNumber };

	DAQDevice();
	virtual ~DAQDevice();

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

	long numSamples = 1000;
	double* data = new double[numSamples];
	long numSamplesReadPerChannel;

	unsigned long task;

	std::vector<DAQDeviceListener*>* listeners = new std::vector<DAQDeviceListener*>();

};

#endif /* DAQDEVICE_H_ */
