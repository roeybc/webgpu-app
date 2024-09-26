@group(0) @binding(0) var<storage, read_write> a : array<f32>;
@group(0) @binding(1) var<storage, read_write> out : array<f32>;

const WORKGROUP_SIZE: u32 = 64u; // Default value

const wgs = vec3(WORKGROUP_SIZE);

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let width = wgs.x;
  let x = lid.x;
  let y = lid.y;
  
  // Calculate the 1D index based on 2D coordinates (x, y)
  let i = y * width + x;
  
  // Add the constant to the input and store in output
  out[i] = a[i] + 5;
}