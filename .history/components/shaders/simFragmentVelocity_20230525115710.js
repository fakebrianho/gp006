// eslint-disable-next-line import/no-anonymous-default-export
export default `

uniform float uProgress;
uniform sampler2D uOriginalPosition;
uniform vec3 uMouse;
uniform float uTime;

float rand(vec2 co){
    return fract(sin(dot(co, vec2( 12))))
}

void main(){

}

`
