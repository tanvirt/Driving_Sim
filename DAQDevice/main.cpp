#include <conio.h>
#include "DAQDevice.h"

int main(void) {
	DAQDevice* device = new DAQDevice();
	device->setNumSamples(1000);

	std::cout << "Started program..." << std::endl;
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

	std::cout << "Ended program" << std::endl;
	return 0;
}
