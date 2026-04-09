// Ocean Fragment Shader - Dynamic water coloring
export const oceanFragmentShader = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vHeight;

  void main() {
    // Dynamic deeper water color based on height
    float depthFactor = smoothstep(-2.0, 2.0, vHeight);
    vec3 deepColor = uColor * 0.5;
    vec3 shallowColor = uColor * 1.5;
    vec3 finalColor = mix(deepColor, shallowColor, depthFactor);

    // Add subtle foam/crest highlights
    float foam = smoothstep(0.5, 1.2, vHeight);
    finalColor = mix(finalColor, vec3(1.0), foam * 0.4);

    // Subtle lighting
    vec3 lightDir = normalize(vec3(5.0, 10.0, 2.0));
    float diff = max(dot(vNormal, lightDir), 0.2);
    
    vec3 finalColorWithDiff = finalColor * diff;
    gl_FragColor = vec4(finalColorWithDiff, 0.9);
  }
`;