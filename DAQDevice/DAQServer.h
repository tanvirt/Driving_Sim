/*
 * DAQServer.h
 *
 *  Created on: Nov 29, 2015
 *      Author: Tanvir
 */

#ifndef DAQSERVER_H_
#define DAQSERVER_H_

class DAQServer {
public:
	DAQServer();
	virtual ~DAQServer();
	void run(unsigned short);
};

#endif /* DAQSERVER_H_ */
