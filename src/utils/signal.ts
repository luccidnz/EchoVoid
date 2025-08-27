export function clamp(n:number,min=0,max=1){ return Math.min(max,Math.max(min,n)); }
export function ema(prev:number, next:number, a=0.2){ return prev*(1-a)+next*a; }

// Compute a simple discrete Fourier transform and return normalized magnitudes
// of the positive frequency bins. Result length is N/2 for input length N.
export function fft(buffer: Float32Array): number[] {
  const N = buffer.length;
  const out: number[] = new Array(Math.floor(N / 2)).fill(0);
  for (let k = 0; k < out.length; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const phi = (-2 * Math.PI * k * n) / N;
      re += buffer[n] * Math.cos(phi);
      im += buffer[n] * Math.sin(phi);
    }
    out[k] = Math.sqrt(re * re + im * im) / N;
  }
  return out;
}
