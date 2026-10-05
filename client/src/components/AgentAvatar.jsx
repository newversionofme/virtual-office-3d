import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { FLOOR_HEIGHTS, AGENT_SLOTS } from './BuildingFloors';

export function AgentAvatar({ agent, index, isSelected, onClick, isPaused }) {
  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const initialized = useRef(false);

  // Compute target slot based on floor and agent index
  const targetFloor = agent.floor || 'FL.02';
  const floorY = FLOOR_HEIGHTS[targetFloor] || 0;
  
  const targetSlot = useMemo(() => {
    const slots = AGENT_SLOTS[targetFloor] || AGENT_SLOTS['FL.02'];
    const slot = slots[index % slots.length] || { x: 0, z: 0, rotation: 0 };
    return {
      x: slot.x,
      y: floorY,
      z: slot.z,
      rotation: slot.rotation || 0
    };
  }, [targetFloor, index, floorY]);

  // Color theme based on agent or status
  const agentColor = agent.color || '#6366f1';
  const statusGlow = useMemo(() => {
    switch (agent.status) {
      case 'in_progress':
        return '#38bdf8'; // Cyan
      case 'done':
        return '#34d399'; // Green
      case 'blocked':
        return '#f87171'; // Red
      default:
        return '#fbbf24'; // Amber
    }
  }, [agent.status]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // First frame initialization
    if (!initialized.current) {
      groupRef.current.position.set(targetSlot.x, targetSlot.y, targetSlot.z);
      currentPos.current.set(targetSlot.x, targetSlot.y, targetSlot.z);
      initialized.current = true;
      return;
    }

    if (isPaused) return;

    // Smooth movement interpolation
    const speed = 4.0;
    const t = Math.min(delta * speed, 1);
    
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetSlot.x, t);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetSlot.y, t);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetSlot.z, t);

    // Walking / Working subtle bounce
    const distToTarget = currentPos.current.distanceTo(
      new THREE.Vector3(targetSlot.x, targetSlot.y, targetSlot.z)
    );
    const isMoving = distToTarget > 0.05;

    let bobOffset = 0;
    if (isMoving) {
      bobOffset = Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.15;
    } else if (agent.status === 'in_progress') {
      // Subtle typing jitter
      bobOffset = Math.sin(state.clock.elapsedTime * 4 + index) * 0.03;
    } else if (agent.status === 'done') {
      // Happy celebratory bounce
      bobOffset = Math.abs(Math.sin(state.clock.elapsedTime * 6 + index)) * 0.08;
    } else {
      // Gentle breathing
      bobOffset = Math.sin(state.clock.elapsedTime * 2 + index) * 0.02;
    }

    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y + bobOffset,
      currentPos.current.z
    );

    // Rotate towards target rotation when arrived
    if (!isMoving) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetSlot.rotation,
        delta * 3
      );
    }
  });

  const statusLabel = useMemo(() => {
    if (agent.status === 'in_progress') return '⚡ In Progress';
    if (agent.status === 'done') return '✨ Completed';
    if (agent.status === 'blocked') return '🛑 Blocked';
    return '☕ Idle';
  }, [agent.status]);

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick(agent);
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Aura Ring / Status Projector Under Feet */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.45, 32]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : statusGlow}
          transparent
          opacity={isSelected ? 0.9 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D Character Body (Low-poly modern robot/avatar) */}
      <group position={[0, 0.35, 0]}>
        {/* Legs / Base */}
        <mesh position={[-0.12, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.12, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.42, 0.4, 0.26]} />
          <meshStandardMaterial color={agentColor} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.34, 0.3, 0.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>

        {/* Visor / Eye screen */}
        <mesh position={[0, 0.52, 0.16]}>
          <planeGeometry args={[0.26, 0.12]} />
          <meshStandardMaterial
            color={statusGlow}
            emissive={statusGlow}
            emissiveIntensity={1.5}
          />
        </mesh>

        {/* Halo / Headset */}
        <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 8, 0, 0]}>
          <torusGeometry args={[0.2, 0.02, 12, 24]} />
          <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Floating 3D HUD & Initial Badge */}
      <Billboard position={[0, 1.45, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* Background pill badge */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.4, 0.45]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>

        {/* Agent Initial Circle */}
        <group position={[-0.45, 0, 0.01]}>
          <mesh>
            <circleGeometry args={[0.16, 24]} />
            <meshBasicMaterial color={agentColor} />
          </mesh>
          <Text
            fontSize={0.14}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {agent.initial || 'AG'}
          </Text>
        </group>

        {/* Agent Name */}
        <Text
          position={[0.1, 0.08, 0.01]}
          fontSize={0.13}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {agent.name.replace('Hermes-', '')}
        </Text>

        {/* Status Subtitle */}
        <Text
          position={[0.1, -0.09, 0.01]}
          fontSize={0.1}
          color={statusGlow}
          anchorX="center"
          anchorY="middle"
        >
          {statusLabel}
        </Text>
      </Billboard>
    </group>
  );
}
