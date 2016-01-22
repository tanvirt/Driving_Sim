#ifndef DAQEXCEPTION_H_
#define DAQEXCEPTION_H_

#include <exception>

class DAQException : public std::exception {

public:
	DAQException(long error) { this->error = error; }

private:
	long error;

public:
	long getError() { return error; }

};

#endif /* DAQEXCEPTION_H_ */
