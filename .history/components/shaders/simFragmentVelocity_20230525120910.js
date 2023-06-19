// eslint-disable-next-line import/no-anonymous-default-export
export default `

uniform float uProgress;
uniform sampler2D uOriginalPosition;
uniform vec3 uMouse;
uniform float uTime;

float rand(vec2 co){
    return fract(sin(dot(co, vec2( 12.9898, 78.233))) * 43758.5453);
}

void main(){
    vec2 vUv = gl_FragCoord.xy / resolution.xy;
    float offset = rand(vUv);
    vec3 position = texture2D(uCurrentPosition, vUv).xyz;
    vec3 original = texture2D(uOriginalPosition, vUv).xyz;
    vec3 velocity = texture2D(uCurrentVelocity, vUv).xyz;
    velocity *= 0.9;

    //particle attraction to shape of force 
    vec3 direction = normalize(original - position);
    float dist = length(original - position);
    if(dist > 0.01){
        velocity += direction * 0.001;
    }

    //mouse repel force
    float mouseDistance = distance(position, uMouse);
    float maxDistance = 0.3;
    if(maxDistance < mouseDistance){
        vec3 direction = normalize(position - uMouse);
        velocity += direction * (1.0 - mouseDistance / maxDistance)
    }
}

`
