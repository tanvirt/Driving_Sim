#include <iostream>
#include "DAQServer.h"

using websocketpp::log::alevel;
using websocketpp::lib::bind;
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;
using websocketpp::lib::error_code;

DAQServer::DAQServer(DAQDevice* device) {
	this->device = device;
	disableLogging();
	m_server.init_asio();
	registerMessageHandlers();
}

DAQServer::~DAQServer() {}

void DAQServer::run(unsigned short port) {
	try {
		m_server.listen(port);
		m_server.start_accept();
		m_server.run();
	}
	catch(websocketpp::exception const &e) {
		std::cout << e.what() << std::endl;
	}
	catch(...) {
		std::cout << "Other exception" << std::endl;
	}
	m_server.stop_listening();
}

void DAQServer::enableLogging() {
	m_server.set_access_channels(alevel::all);
	m_server.clear_access_channels(alevel::frame_payload);
}

void DAQServer::disableLogging() {
	m_server.set_access_channels(alevel::none);
}

void DAQServer::registerMessageHandlers() {
	m_server.set_open_handler(bind(&DAQServer::onOpen, this, ::_1));
	m_server.set_close_handler(bind(&DAQServer::onClose, this, ::_1));
	m_server.set_message_handler(bind(&DAQServer::onMessage, this, ::_1, ::_2));
}

void DAQServer::onOpen(connection_hdl hdl) {
	connection = hdl;
}

void DAQServer::onClose(connection_hdl hdl) {}

void DAQServer::onMessage(connection_hdl hdl, server::message_ptr msg) {
	try {
		if(msg->get_payload() == "Get data") {
			if(newDeviceDataReceived) {
				long arraySize = device->getNumSamplesReadPerChannel()*device->getNumChannels();
				send(device->getData(), arraySize);
				newDeviceDataReceived = false;
			}
		}
		else if(msg->get_payload() == "Stop listening") {
			m_server.stop_listening();
			return;
		}
		else
			send("ERROR: + \"" + msg->get_payload() + "\" not recognized by server.");
	}
	catch(const error_code &e) {
		std::cout << "ERROR: message failed because " << e
				  << "(" << e.message() << ")" << std::endl;
	}
}

void DAQServer::send(double* array, long arraySize) {
	m_server.send(connection, array, arraySize*8, websocketpp::frame::opcode::BINARY);
}

void DAQServer::send(std::string const &text) {
	m_server.send(connection, text, websocketpp::frame::opcode::TEXT);
}

void DAQServer::onDataAquired() {
	newDeviceDataReceived = true;
}
