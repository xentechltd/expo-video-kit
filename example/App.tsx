import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Button, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { ConversionConfigDefault, VideoKit } from 'expo-video-kit';

function getFileName(uri: string): string {
  const parts = uri.split('/');
  const lastPart = parts[parts.length - 1] ?? 'video.mp4';
  return lastPart.includes('.') ? lastPart : `${lastPart}.mp4`;
}

export default function App() {
  const [status, setStatus] = useState('Pick a video to get started');
  const [progress, setProgress] = useState(0);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handlePickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setStatus('Photo library permission is required to pick a video');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    setSelectedVideoUri(asset.uri);
    setSelectedVideoName(asset.fileName ?? getFileName(asset.uri));
    setProgress(0);
    setStatus('Video selected. Tap Convert to process it.');
  };

  const handleConvert = async () => {
    if (!selectedVideoUri) {
      setStatus('Pick a video first');
      return;
    }

    const outputFileName = `converted_${selectedVideoName ?? 'video.mp4'}`;
    const outputPath = new File(Paths.cache, outputFileName).uri;

    setIsBusy(true);
    setStatus('Converting...');
    setProgress(0);

    try {
      const videoKit = new VideoKit();
      await videoKit.convert(
        selectedVideoUri,
        outputPath,
        ConversionConfigDefault,
        (value) => setProgress(value)
      );
      setStatus(`Conversion complete: ${outputPath}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Expo VideoKit</Text>
        <View style={styles.group}>
          <Text style={styles.label}>Status: {status}</Text>
          <Text style={styles.label}>Progress: {Math.round(progress * 100)}%</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          {isBusy && progress < 0.01 ? (
            <ActivityIndicator style={styles.spinner} />
          ) : null}
          <Text style={styles.label}>
            Selected: {selectedVideoName ?? 'None'}
          </Text>
          {selectedVideoUri ? (
            <Text style={styles.uri} numberOfLines={2}>
              {selectedVideoUri}
            </Text>
          ) : null}
          <View style={styles.buttonRow}>
            <Button
              title="Pick video"
              onPress={handlePickVideo}
              disabled={isBusy}
            />
            <Button
              title="Convert"
              onPress={handleConvert}
              disabled={isBusy || !selectedVideoUri}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: { fontSize: 30, marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 12 },
  progressTrack: {
    backgroundColor: '#ddd',
    borderRadius: 6,
    height: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#007AFF',
    height: '100%',
  },
  spinner: { marginBottom: 12 },
  uri: { fontSize: 12, color: '#666', marginBottom: 16 },
  buttonRow: { gap: 12 },
  group: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  content: {
    padding: 20,
  },
  container: { flex: 1, backgroundColor: '#eee' },
};
