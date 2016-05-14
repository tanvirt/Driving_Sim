#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <iostream>
#include "DAQServer.h"

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    DAQDevice* device = new DAQDevice();
    deviceThread = new DeviceThread(device);
    serverThread = new ServerThread(device);

    ui->brakePressure->setText("Dev1/ai6");
    ui->gasPosition->setText("Dev1/ai7");
    ui->wheelRotation->setText("Dev1/ai16");
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_startButton_clicked()
{
    if(ui->startButton->text() != "Running") {
        std::string brakePressureChannel = ui->brakePressure->text().toUtf8().constData();
        std::string gasPositionChannel = ui->gasPosition->text().toUtf8().constData();
        std::string wheelRotationChannel = ui->wheelRotation->text().toUtf8().constData();

        std::vector<std::string>* channels = new std::vector<std::string>();
        channels->push_back(brakePressureChannel);
        channels->push_back(gasPositionChannel);
        channels->push_back(wheelRotationChannel);

        deviceThread->setChannels(channels);

        deviceThread->start();
        serverThread->start();
        ui->startButton->setText("Running");
    }
    else
        std::cout << "Already running..." << std::endl;
}

void MainWindow::on_stopButton_clicked()
{
    exit(1);
}
