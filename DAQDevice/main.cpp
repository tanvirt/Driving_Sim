#include <conio.h>
#include "DAQDevice.h"
#include "DAQServer.h"
#include <boost/thread.hpp>

void runDevice() {
	DAQDevice* device = new DAQDevice();
	device->setNumSamples(1000);

	try {
		device->loadTask("MyVoltageTask");
		device->startTask();

		while(!device->taskIsDone() && !kbhit()) {
			device->readAnalogData(10.0, device->GroupByChannel);

			std::cout << "Acquired " << device->getNumSamplesReadPerChannel()
					<< " points" << std::endl;
			std::cout << "data[500] = " << device->getData()[500] << std::endl;
		}
	}
	catch(DAQException* e) {
		device->handleError(e->getError());
	}
}

void runServer() {
	DAQServer* server = new DAQServer();
	server->run(9002);
}

int main(void) {
	std::cout << "Started program..." << std::endl;

	boost::thread deviceThread(runDevice);
	boost::thread deviceServer(runServer);

	deviceThread.join();
	deviceServer.join();

	std::cout << "Ended program" << std::endl;
	return 0;
}
