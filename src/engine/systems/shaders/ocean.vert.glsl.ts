// Ocean Vertex Shader - Gerstner-inspired waves
export const oceanVertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vHeight;

  void main() {
    vec3 pos = position;
    
    // Gerstner-inspired simplified waves
    float xOffset = sin(pos.x * uFrequency + uTime) * uAmplitude;
    float yOffset = cos(pos.y * uFrequency + uTime * 0.8) * uAmplitude;
    
    pos.z += xOffset + yOffset;
    vHeight = pos.z;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;