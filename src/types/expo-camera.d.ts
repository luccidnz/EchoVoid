declare module 'expo-camera' {
  import * as React from 'react';
  export interface CameraProps {
    type?: any;
    style?: any;
    ref?: any;
    [key: string]: any;
  }
  export class Camera extends React.Component<CameraProps> {}
  export function useCameraPermissions(): [any, any];
  export const CameraType: { Back: any; Front: any };
}
