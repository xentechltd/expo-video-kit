import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ConversionConfigDefault, VideoKit } from 'expo-video-kit';

function getFileName(uri: string): string {
  const parts = uri.split('/');
  const lastPart = parts[parts.length - 1] ?? 'video.mp4';
  return lastPart.includes('.') ? lastPart : `${lastPart}.mp4`;
}

function progressPhaseLabel(progress: number): string {
  if (progress < 0.5) {
    return 'Converting';
  }
  if (progress < 1) {
    return 'Uploading';
  }
  return 'Done';
}

export default function App() {
  const [status, setStatus] = useState('Pick a video to get started');
  const [progress, setProgress] = useState(0);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const outputFileName = selectedVideoName
    ? `converted_${selectedVideoName}`
    : 'converted_video.mp4';
  const outputPath = new File(Paths.cache, outputFileName).uri;

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
    setStatus('Video selected. Convert locally or convert & upload with a presigned URL.');
  };

  const handleConvert = async () => {
    if (!selectedVideoUri) {
      setStatus('Pick a video first');
      return;
    }

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

  const handleConvertAndUpload = async () => {
    if (!selectedVideoUri) {
      setStatus('Pick a video first');
      return;
    }

    const trimmedUploadUrl = uploadUrl.trim();
    if (!trimmedUploadUrl) {
      setStatus('Enter a presigned upload URL (PUT)');
      return;
    }

    setIsBusy(true);
    setStatus('Convert & upload: converting...');
    setProgress(0);

    try {
      const videoKit = new VideoKit();
      await videoKit.convertAndUpload(
        selectedVideoUri,
        trimmedUploadUrl,
        ConversionConfigDefault,
        { contentType: 'video/mp4', method: 'PUT' },
        (value) => {
          setProgress(value);
          setStatus(`Convert & upload: ${progressPhaseLabel(value)}...`);
        },
        outputPath
      );
      setStatus('Convert & upload finished successfully');
      setProgress(1);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Convert & upload failed');
    } finally {
      setIsBusy(false);
    }
  };

  const canConvertAndUpload =
    Boolean(selectedVideoUri) && uploadUrl.trim().length > 0 && !isBusy;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Expo VideoKit</Text>
        <View style={styles.group}>
          <Text style={styles.label}>Status: {status}</Text>
          <Text style={styles.label}>
            Progress: {Math.round(progress * 100)}% ({progressPhaseLabel(progress)})
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          {isBusy && progress < 0.01 ? (
            <ActivityIndicator style={styles.spinner} />
          ) : null}
          <Text style={styles.label}>Selected: {selectedVideoName ?? 'None'}</Text>
          {selectedVideoUri ? (
            <Text style={styles.uri} numberOfLines={2}>
              {selectedVideoUri}
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Convert & upload</Text>
          <Text style={styles.hint}>
            Paste a presigned PUT URL (e.g. S3). Progress is 0–50% convert, 50–100% upload.
          </Text>
          <TextInput
            style={styles.input}
            value={uploadUrl}
            onChangeText={setUploadUrl}
            placeholder="https://..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isBusy}
            multiline
          />
          <Text style={styles.hint} numberOfLines={2}>
            Output cache path: {outputPath}
          </Text>

          <View style={styles.buttonRow}>
            <Button title="Pick video" onPress={handlePickVideo} disabled={isBusy} />
            <Button
              title="Convert only"
              onPress={handleConvert}
              disabled={isBusy || !selectedVideoUri}
            />
            <Button
              title="Convert & upload"
              onPress={handleConvertAndUpload}
              disabled={!canConvertAndUpload}
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
  sectionTitle: { fontSize: 18, fontWeight: '600' as const, marginBottom: 8, marginTop: 8 },
  hint: { fontSize: 13, color: '#666', marginBottom: 10 },
  input: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111',
    fontSize: 14,
    marginBottom: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
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
