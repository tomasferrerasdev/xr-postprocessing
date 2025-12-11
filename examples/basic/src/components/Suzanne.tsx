import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { JSX } from 'react'

type GLTFResult = GLTF & {
  nodes: {
    Suzanne_0: THREE.Mesh
  }
  materials: {
    Skin: THREE.MeshStandardMaterial
  }
}

export const Suzanne = (props: JSX.IntrinsicElements['group']) => {
  const { nodes, materials } = useGLTF(
    '/assets/suzanne_skin_material_test.glb',
  ) as unknown as GLTFResult
  return (
    <group {...props} dispose={null} position={[0, 1, -2]}>
      <group name="Sketchfab_Scene">
        <group
          name="Sketchfab_model"
          position={[0, -0.011, -0.005]}
          rotation={[-2.049, 0, 0]}
          scale={0.319}
        >
          <group name="Root">
            <group name="Lamp" position={[4.076, 1.005, 5.904]} rotation={[1.35, 0.592, 1.927]}>
              <group name="Lamp_1" />
            </group>
            <group name="Suzanne">
              <mesh
                name="Suzanne_0"
                castShadow
                receiveShadow
                geometry={nodes.Suzanne_0.geometry}
                material={materials.Skin}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/assets/suzanne_skin_material_test.glb')
