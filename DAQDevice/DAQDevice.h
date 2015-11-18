#ifndef DAQDEVICE_H_
#define DAQDEVICE_H_

#include <iostream>
#include "NIDAQmx.h"
#include "DAQException.h"

class DAQDevice {

public:
	DAQDevice();
	virtual ~DAQDevice();

private:
	signed long numSamples;
	double* data;
	unsigned long taskHandle;
	signed long numSamplesReadPerChannel;

public:
	enum FillMode { GroupByChannel, GroupByScanNumber };

	void setNumSamples(signed long);

	double* getData();
	signed long getNumSamplesReadPerChannel();

	void loadTask(const char *);
	void startTask();
	void stopTask();
	void clearTask();
	bool taskIsLoaded();
	bool taskIsDone();

	void readAnalogData(double, FillMode);

	void handleError(signed long);
	std::string getErrorInfo(signed long);
	bool isError(signed long);

};

#endif /* DAQDEVICE_H_ */
