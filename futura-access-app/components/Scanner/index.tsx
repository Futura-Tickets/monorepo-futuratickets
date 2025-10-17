import { useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

// CAMERA
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

// SERVICES
import { checkAccess } from '../shared/services';

let scanning = false;

export default function Scanner({ navigation }: { navigation: NavigationProp<any, any> }) {

  const [scanResult, setScanResult] = useState<{ access: string; reason: string; } | undefined>();
  const [cameraStatus, setCameraStatus] = useState<boolean>(true);

  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>();

  const resumeCamera = (): void => {
    cameraRef.current.resumePreview();
    setScanResult(undefined);
    setCameraStatus(true);
  };

  const onSuccess = async (scanningResult: BarcodeScanningResult): Promise<void> => {
    
    if(!scanning) {

      scanning = true;
      
      cameraRef.current.pausePreview();
      setCameraStatus(false);
  
      console.log('Scanning ...');
      
      const test = 'https://event.futuratickets.com/verify/675c45f89ecc7fdb2f6a7389'
      const ticket = test.split('/')[4];
      const access = await checkAccess(ticket);
  
      console.log(scanningResult);
  
      setScanResult(access);
      
      setTimeout(() => {
        scanning = false;
      }, 1000);

    }

  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permitContainer}>
        <View style={styles.permitContent}>
          <Text style={styles.permitText}>We need your permission to show the camera</Text>
          <TouchableOpacity onPress={() => requestPermission}>
            <Text style={styles.button}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 100}}>
          <Image style={styles.image} source={require('../../assets/futura-tickets.png')}/>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={(data) => cameraStatus && onSuccess(data)} style={StyleSheet.absoluteFillObject} facing='back'/>
      <View style={styles.scanBox}>
        <Image style={styles.scanImage} source={require('../../assets/scan-white.png')}/>
      </View>
      <View style={styles.box}>
        {scanResult?.access == "ACCESS DENIED" && 
          <View>
            <Text style={styles.textDenied}>{scanResult?.access}</Text>
            <Text style={styles.textReason}>{scanResult?.reason}</Text>
          </View>
        }
        {scanResult?.access == "ACCESS GRANTED" && 
          <View>
            <Text style={styles.textDenied}>{scanResult?.access}</Text>
            <Text style={styles.textReason}>{scanResult?.reason}</Text>
          </View>
        }
        {!cameraStatus && 
          <TouchableOpacity style={styles.button} onPress={resumeCamera}>
            <Text style={styles.text}>Next</Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permitContainer: {
    flex: 1,
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  permitContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  scanBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  box: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanImage: {
    width: 200,
    height: 200
  },
  image: {
    justifyContent: "center",
    width: 107,
    height: 35,
    marginTop: 30
  },
  button: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    color: '#333',
    borderColor: '#333',
    borderWidth: 2,
    fontSize: 14,
    fontWeight: 'bold',
    borderRadius: 8,
    marginTop: 15,
    width: 150,
  },
  permitText: {
    fontSize: 21,
    fontWeight: 500,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 28
  },
  text: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  textDenied: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#fe5456',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    textAlign: 'center',
    borderColor: '#e4e4e4',
    borderRadius: 8,
    marginTop: 15
  },
  textGranted: {
    fontSize: 21,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#00948a',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    textAlign: 'center',
    borderColor: '#e4e4e4',
    borderRadius: 8,
    marginTop: 15
  },
  textReason: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 30,
  }
});