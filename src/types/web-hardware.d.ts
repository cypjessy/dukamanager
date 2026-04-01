interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
  readable: ReadableStream;
  writable: WritableStream;
}

interface Navigator {
  serial?: {
    requestPort(options?: Record<string, unknown>): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
  usb?: {
    requestDevice(options: Record<string, unknown>): Promise<{ productName?: string }>;
    getDevices(): Promise<{ productName?: string }[]>;
  };
}
