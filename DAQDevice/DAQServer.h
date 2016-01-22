#ifndef DAQSERVER_H_
#define DAQSERVER_H_

#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include "DAQDevice.h"

typedef websocketpp::server<websocketpp::config::asio> server;
typedef server::message_ptr message_ptr;

using websocketpp::connection_hdl;

class DAQServer : public DAQDeviceListener {

private:
	server m_server;
	connection_hdl connection;

	DAQDevice* device;
	bool newDeviceDataReceived;

	void enableLogging();
	void disableLogging();
	void registerMessageHandlers();

	void onOpen(connection_hdl hdl);
	void onClose(connection_hdl hdl);
	void onMessage(connection_hdl hdl, server::message_ptr msg);

	void onDataAquired();

public:
	DAQServer(DAQDevice* device);
	virtual ~DAQServer();

	void send(double* array, long arraySize);
	void send(std::string const &text);

	void run(unsigned short port);
};

#endif /* DAQSERVER_H_ */
