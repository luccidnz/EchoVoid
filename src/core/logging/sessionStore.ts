import * as FileSystem from 'expo-file-system';
export async function ensureSessionsDir(){
  const dir = FileSystem.documentDirectory + 'sessions/';
  const info = await FileSystem.getInfoAsync(dir);
  if(!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates:true });
  return dir;
}
export async function writeSession(name:string, data:any){
  const dir = await ensureSessionsDir();
  const path = `${dir}${name}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data,null,2));
  return path;
}
