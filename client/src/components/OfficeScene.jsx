import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Floor02Kitchen, Floor03Workspace, Floor04Rooftop } from './BuildingFloors';
import { AgentAvatar } from './AgentAvatar';

export function OfficeScene({
  agents = [],
  selectedAgent,
  onSelectAgent,
  activeFloor,
  isAutoRotate,
  isPaused
}) {
  const controlsRef = useRef();

  // Determine floor visibility
  const showFL02 = activeFloor === 'ALL' || activeFloor === 'FL.02';
  const showFL03 = activeFloor === 'ALL' || activeFloor === 'FL.03';
  const showFL04 = activeFloor === 'ALL' || activeFloor === 'FL.04';

  const targetY =
    activeFloor === 'FL.04' ? 9.0 : activeFloor === 'FL.03' ? 4.5 : activeFloor === 'FL.02' ? 0 : 4.5;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{
          position: [16, 18, 16],
          fov: 38,
          near: 0.1,
          far: 100
        }}
      >
        {/* Modern Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[14, 25, 12]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={60}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
        {/* Point Lights for Interior Ambiance */}
        <pointLight position={[-2, 5.5, 0]} intensity={0.6} color="#38bdf8" />
        <pointLight position={[2, 10.0, 0]} intensity={0.6} color="#f59e0b" />
        <pointLight position={[0, 1.2, 0]} intensity={0.4} color="#10b981" />

        {/* Isometric Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          autoRotate={isAutoRotate}
          autoRotateSpeed={1.0}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={6}
          maxDistance={45}
          target={[0, targetY, 0]}
        />

        <Suspense fallback={null}>
          {/* Building Floors */}
          <group position={[0, 0, 0]}>
            <Floor02Kitchen isVisible={showFL02} />
            <Floor03Workspace isVisible={showFL03} />
            <Floor04Rooftop isVisible={showFL04} />
          </group>

          {/* Render Agents */}
          <group>
            {agents.map((agent, index) => {
              // Only render if agent's current floor is visible
              const isAgentFloorVisible =
                activeFloor === 'ALL' || agent.floor === activeFloor;
              if (!isAgentFloorVisible) return null;

              return (
                <AgentAvatar
                  key={agent.id}
                  agent={agent}
                  index={index}
                  isSelected={selectedAgent?.id === agent.id}
                  onClick={onSelectAgent}
                  isPaused={isPaused}
                />
              );
            })}
          </group>

          {/* Ground Shadows */}
          <ContactShadows
            position={[0, -0.45, 0]}
            opacity={0.6}
            scale={25}
            blur={1.5}
            far={10}
            resolution={512}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
