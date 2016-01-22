#ifndef DAQEXCEPTION_H_
#define DAQEXCEPTION_H_

#include <exception>

class DAQException : public std::exception {

public:
	DAQException(long error) { this->error = error; }
	virtual ~DAQException() {}

	long getError() { return error; }

private:
	long error;

};

#endif /* DAQEXCEPTION_H_ */
