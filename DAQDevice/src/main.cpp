#include <boost/thread.hpp>
#include "DAQServer.h"
#include "DAQException.h"

void runDevice(DAQDevice* device) {
	try {
		device->loadTask("MyVoltageTask");
		device->setNumSamplesPerChannel(1);
		device->startTask();

		while(!device->taskIsDone())
			device->readAnalogData(10, device->GroupByScanNumber);
	}
	catch(DAQException* e) {
		device->handleError(e->getError());
		delete e;
	}
}

void runServer(DAQServer* server) {
	server->run(9002);
}

int main(void) {
	std::cout << "Started program..." << std::endl;

	DAQDevice* device = new DAQDevice();
	DAQServer* server = new DAQServer(device);
	device->addListener(server);

	boost::thread deviceThread(runDevice, device);
	boost::thread serverThread(runServer, server);

	deviceThread.join();
	serverThread.join();

	delete device;
	delete server;

	std::cout << "Ended program" << std::endl;

	return 0;
}
