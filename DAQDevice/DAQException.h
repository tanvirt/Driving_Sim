#ifndef DAQEXCEPTION_H_
#define DAQEXCEPTION_H_

#include <exception>

class DAQException : public std::exception {

public:
	DAQException(signed long error);

private:
	signed long error;

public:
	signed long getError();

};

#endif /* DAQEXCEPTION_H_ */
