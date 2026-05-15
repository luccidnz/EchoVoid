import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Magnetometer, Accelerometer, LightSensor } from 'expo-sensors';
import { Camera as ExpoCamera, CameraType, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import EnergyHeatmap from '../../components/fx/EnergyHeatmap';
import EVoidSlider from '../../components/controls/Slider';
import SessionStore from '../../services/sessions/SessionStore';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function ARModeScreen({ navigation }: any) {
  const [mag, setMag] = useState([0, 0, 0]);
  const [acc, setAcc] = useState([0, 0, 0]);
  const [light, setLight] = useState(0);
  const [sensitivity, setSensitivity] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted ?? false;
  const cameraRef = useRef(null);
  const [type] = useState(CameraType.Back);

  useEffect(() => {
    if (!hasPermission) requestPermission();
    const magSub = Magnetometer.addListener((d) => setMag([d.x, d.y, d.z]));
    const accSub = Accelerometer.addListener((d) => setAcc([d.x, d.y, d.z]));
    let lightSub: any;
    try {
      lightSub = LightSensor.addListener((d) => setLight(d.illuminance));
    } catch {}
    return () => {
      magSub.remove();
      accSub.remove();
      if (lightSub) lightSub.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
        const session = {
          id: Date.now().toString(),
          type: 'ar',
          date: new Date().toISOString(),
          spikes: [],
        };
        await SessionStore.create(session);
        setSessionId(session.id);
      } catch (e) {
        console.error('Failed to initialize AR session', e);
      }
    })();
  }, []);

  const handleSpike = async (variance: number) => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      if (sessionId) {
        await SessionStore.addSpike(sessionId, {
          timestamp: new Date().toISOString(),
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          variance,
        });
      }
    } catch (e) {
      console.error('Failed to record spike', e);
    }
  };

  // Log navigation prop
  console.log('[ARModeScreen] navigation prop:', navigation);

  // AR overlay: Three.js compass
  const onContextCreate = async (gl: any) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.z = 2;
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    // Compass arrow
    const geometry = new THREE.ConeGeometry(0.2, 0.6, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00e0ff });
    const cone = new THREE.Mesh(geometry, material);
    scene.add(cone);

    // Animate
    const animate = () => {
      // Use magnetometer to rotate compass
      const [mx, my] = mag;
      cone.rotation.z = Math.atan2(my, mx);
      renderer.render(scene, camera);
      gl.endFrameEXP();
      requestAnimationFrame(animate);
    };
    animate();
  };

  return (
    <View style={{ flex: 1 }}>
      {hasPermission && (
        <ExpoCamera ref={cameraRef} style={StyleSheet.absoluteFill} type={type} />
      )}
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
      />
      <EnergyHeatmap
        magnetometer={mag}
        accelerometer={acc}
        sensitivity={sensitivity}
        onSpike={handleSpike}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.h1}>AR Mode</Text>
        <Text style={styles.p}>Magnetometer: {mag.map((v) => v.toFixed(2)).join(', ')}</Text>
        <Text style={styles.p}>Accelerometer: {acc.map((v) => v.toFixed(2)).join(', ')}</Text>
        <Text style={styles.p}>Light: {light ? light.toFixed(2) : 'n/a'} lux</Text>
        <Text style={styles.p}>(3D compass overlays camera, reacts to sensors)</Text>
        <EVoidSlider
          value={sensitivity}
          onChange={setSensitivity}
          min={0.1}
          max={5}
          step={0.1}
          label="Sensitivity"
          format=""
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, padding: 24, alignItems: 'center' },
  h1: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 32 },
  p: { color: colors.subtext, marginTop: 8 },
});
