#-------------------------------------------------
#
# Project created by QtCreator 2016-04-12T19:01:47
#
#-------------------------------------------------

QT       += core gui

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = Driving_Sim
TEMPLATE = app


SOURCES += main.cpp\
        mainwindow.cpp \
    DAQDevice.cpp \
    DAQServer.cpp \
    ServerThread.cpp \
    DeviceThread.cpp

HEADERS  += mainwindow.h \
    DAQDevice.h \
    DAQDeviceListener.h \
    DAQException.h \
    DAQServer.h \
    NIDAQmx.h \
    ServerThread.h \
    DeviceThread.h

FORMS    += mainwindow.ui

INCLUDEPATH += $$PWD/.
DEPENDPATH += $$PWD/.

INCLUDEPATH += $$PWD/../../boost
DEPENDPATH += $$PWD/../../boost

INCLUDEPATH += $$PWD/../../websocketpp
DEPENDPATH += $$PWD/../../websocketpp

win32:CONFIG(release, debug|release): LIBS += -L$$PWD/lib/ -lNIDAQmx
else:win32:CONFIG(debug, debug|release): LIBS += -L$$PWD/lib/ -lNIDAQmx
else:unix: LIBS += -L$$PWD/lib/ -lNIDAQmx

win32:CONFIG(release, debug|release): LIBS += -L$$PWD/lib/ -lmynicaiu
else:win32:CONFIG(debug, debug|release): LIBS += -L$$PWD/lib/ -lmynicaiu
else:unix: LIBS += -L$$PWD/lib/ -lmynicaiu

win32:CONFIG(release, debug|release): LIBS += -L$$PWD/lib/ -lws2_32
else:win32:CONFIG(debug, debug|release): LIBS += -L$$PWD/lib/ -lws2_32
else:unix: LIBS += -L$$PWD/lib/ -lws2_32

win32:CONFIG(release, debug|release): LIBS += -L$$PWD/lib/ -lwsock32
else:win32:CONFIG(debug, debug|release): LIBS += -L$$PWD/lib/ -lwsock32
else:unix: LIBS += -L$$PWD/lib/ -lwsock32

win32:CONFIG(release, debug|release): LIBS += -L$$PWD/lib/ -lNIDAQmx
else:win32:CONFIG(debug, debug|release): LIBS += -L$$PWD/lib/ -lNIDAQmx
else:unix: LIBS += -L$$PWD/lib/ -lNIDAQmx

win32:CONFIG(release, debug|release): LIBS += -L$$PWD/../../boost/stage/lib/ -lboost_system-mgw48-mt-1_59
else:win32:CONFIG(debug, debug|release): LIBS += -L$$PWD/../../boost/stage/lib/ -lboost_system-mgw48-mt-d-1_59
else:unix: LIBS += -L$$PWD/../../boost/stage/lib/ -lboost_system-mgw48-mt-1_59

win32:CONFIG(release, debug|release): LIBS += -L$$PWD/../../boost/stage/lib/ -lboost_thread-mgw48-mt-1_59
else:win32:CONFIG(debug, debug|release): LIBS += -L$$PWD/../../boost/stage/lib/ -lboost_thread-mgw48-mt-1_59
else:unix: LIBS += -L$$PWD/../../boost/stage/lib/ -lboost_thread-mgw48-mt-1_59
