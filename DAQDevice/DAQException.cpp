#include "DAQException.h"

DAQException::DAQException(signed long error) {
	this->error = error;
}

signed long DAQException::getError() {
	return error;
}
