#ifndef SERVERTHREAD_H
#define SERVERTHREAD_H
#include <QThread>
#include "DAQServer.h"

class ServerThread : public QThread
{
    Q_OBJECT
public:
    ServerThread(DAQDevice* device);
    void run();
private:
    DAQServer* server;
};

#endif // SERVERTHREAD_H
