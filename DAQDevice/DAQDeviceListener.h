#ifndef DAQDEVICELISTENER_H_
#define DAQDEVICELISTENER_H_

class DAQDeviceListener {

public:
	DAQDeviceListener() {}
	virtual ~DAQDeviceListener() {}

	virtual void onDataAquired() = 0;

};

#endif /* DAQDEVICELISTENER_H_ */
