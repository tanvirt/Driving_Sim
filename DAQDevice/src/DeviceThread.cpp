#include "DeviceThread.h"
#include "DAQException.h"

DeviceThread::DeviceThread(DAQDevice* device)
{
    this->device = device;
}

void DeviceThread::run() {
    try {
        //device->loadTask("MyVoltageTask");

        std::string brakePressureChannel = this->channels->at(0);
        std::string gasPositionChannel = this->channels->at(1);
        std::string gasPressureChannel = this->channels->at(2);

        device->createTask("");
        device->createAIVoltageChannel(brakePressureChannel.c_str());
        device->createAIVoltageChannel(gasPositionChannel.c_str());
        device->createAIVoltageChannel(gasPressureChannel.c_str());

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

void DeviceThread::setChannels(std::vector<std::string>* channels) {
    this->channels = channels;
}
