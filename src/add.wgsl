@group(0) @binding(0) var<storage, read_write> a : array<f32>;
@group(0) @binding(1) var<storage, read_write> out : array<f32>;

const WORKGROUP_SIZE: u32 = 64u; // Default value

const wgs = vec3(WORKGROUP_SIZE);

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let x = lid.x;
  let i = x;
  out[i] = a[i] + 5;
}