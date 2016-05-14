#ifndef DEVICETHREAD_H
#define DEVICETHREAD_H
#include <string>
#include "DAQDevice.h"
#include <QThread>

class DeviceThread : public QThread
{
    Q_OBJECT
public:
    DeviceThread(DAQDevice* device);
    void run();
    void setChannels(std::vector<std::string>* channels);
private:
    DAQDevice* device;
    int numChannels = 0;
    std::vector<std::string>* channels;
};

#endif // DEVICETHREAD_H
