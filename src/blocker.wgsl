@group(0) @binding(0) var<storage, read_write> a : array<f32>;
@group(0) @binding(1) var<storage, read_write> out : array<f32>;

const WORKGROUP_SIZE: u32 = 9u;
const wgs = vec3(WORKGROUP_SIZE);
var<workgroup> shared_memory: array<f32, 9>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(local_invocation_id) lid: vec3<u32>,
@builtin(global_invocation_id) gid: vec3<u32>) {
  shared_memory[lid.x] = a[gid.x];

  workgroupBarrier();
  out[gid.x] = shared_memory[lid.x];
  if (gid.x > 0) {
      out[gid.x] += shared_memory[lid.x - 1];
  }
}