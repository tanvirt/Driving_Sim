#include "ServerThread.h"

ServerThread::ServerThread(DAQDevice* device)
{
    this->server = new DAQServer(device);
    device->addListener(this->server);
}

void ServerThread::run() {
    server->run(9002);
}
