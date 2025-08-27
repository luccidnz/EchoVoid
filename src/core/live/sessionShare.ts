// Placeholder for shared live sessions and invitations
export type Participant = { id:string; name:string };
export function createLiveSession() {
  console.log('Creating live session...');
  // Placeholder implementation
  return { id: Date.now().toString(), participants: [] };
}

export function joinLiveSession(id: string) {
  console.log(`Joining live session with ID: ${id}`);
  // Placeholder implementation
  return { success: true };
}

export function onAnomaly(cb: (data: any) => void) {
  console.log('Subscribing to anomalies...');
  // Placeholder implementation
  setInterval(() => {
    cb({ time: Date.now(), freq: Math.random() * 5000, confidence: Math.random() });
  }, 5000);
}
