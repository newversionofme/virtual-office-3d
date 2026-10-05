import React from 'react';
import { Text, RoundedBox } from '@react-three/drei';

export const FLOOR_HEIGHTS = {
  'FL.02': 0,
  'FL.03': 4.5,
  'FL.04': 9.0
};

// Floor boundary positions for agent destinations
export const AGENT_SLOTS = {
  'FL.03': [
    { x: -3.5, z: -2.5, rotation: 0, label: 'Workstation Alpha' },
    { x: -1.0, z: -2.5, rotation: 0, label: 'Workstation Beta' },
    { x: 1.5, z: -2.5, rotation: 0, label: 'Workstation Gamma' },
    { x: -3.5, z: 2.0, rotation: Math.PI, label: 'Workstation Delta' },
    { x: -1.0, z: 2.0, rotation: Math.PI, label: 'Workstation Epsilon' },
    { x: 2.8, z: 1.0, rotation: -Math.PI / 2, label: 'Meeting Board' }
  ],
  'FL.02': [
    { x: -3.0, z: -2.0, rotation: 0, label: 'Coffee Station' },
    { x: -0.5, z: -1.5, rotation: Math.PI / 4, label: 'Dining Table 1' },
    { x: 1.5, z: -1.5, rotation: -Math.PI / 4, label: 'Dining Table 2' },
    { x: -2.0, z: 2.2, rotation: 0, label: 'Lounge Sofa' },
    { x: 1.0, z: 2.2, rotation: 0, label: 'Vending Bar' },
    { x: 3.2, z: 0.0, rotation: -Math.PI / 2, label: 'Snack Corner' }
  ],
  'FL.04': [
    { x: -3.0, z: -1.5, rotation: 0, label: 'Rooftop Bar' },
    { x: -0.5, z: -2.0, rotation: 0, label: 'Sun Lounger' },
    { x: 2.5, z: -1.5, rotation: -Math.PI / 3, label: 'Observation Deck' },
    { x: -2.5, z: 2.0, rotation: Math.PI / 2, label: 'Chill Beanbag' },
    { x: 0.5, z: 2.0, rotation: 0, label: 'Garden Terrace' },
    { x: 3.0, z: 1.8, rotation: -Math.PI / 4, label: 'Skyline View' }
  ]
};

// Floor base with grid and glass walls
function FloorBase({ y, color, label, subtitle, isVisible = true }) {
  if (!isVisible) return null;

  return (
    <group position={[0, y, 0]}>
      {/* Main Floor Slab */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[11, 0.4, 8.5]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Grid line accents */}
      <gridHelper args={[10.5, 10, '#475569', '#334155']} position={[0, 0.01, 0]} />

      {/* Floor Plate Label 3D */}
      <group position={[-5.0, 0.1, 4.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={0.5}
          color="#ffffff"
          anchorX="left"
          anchorY="bottom"
          fontWeight="bold"
        >
          {label}
        </Text>
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.25}
          color="#94a3b8"
          anchorX="left"
          anchorY="bottom"
        >
          {subtitle}
        </Text>
      </group>

      {/* Modern Back & Left Accent Walls */}
      <mesh position={[0, 1.2, -4.1]}>
        <boxGeometry args={[11, 2.4, 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[-5.4, 1.2, 0]}>
        <boxGeometry args={[0.2, 2.4, 8.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Modern Glass Railing / Front Border */}
      <mesh position={[0, 0.5, 4.15]}>
        <boxGeometry args={[11, 1.0, 0.1]} />
        <meshStandardMaterial
          color="#93c5fd"
          opacity={0.35}
          transparent
          roughness={0.1}
        />
      </mesh>
      <mesh position={[5.4, 0.5, 0]}>
        <boxGeometry args={[0.1, 1.0, 8.4]} />
        <meshStandardMaterial
          color="#93c5fd"
          opacity={0.35}
          transparent
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// FL.02 Kitchen & Dining Props
export function Floor02Kitchen({ isVisible = true }) {
  if (!isVisible) return null;
  const y = FLOOR_HEIGHTS['FL.02'];

  return (
    <group position={[0, y, 0]}>
      <FloorBase y={0} color="#1e293b" label="FL.02" subtitle="Kitchen & Dining Lounge" />

      {/* Coffee Bar Counter */}
      <group position={[-3.2, 0, -2.5]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Espresso Machine */}
        <mesh position={[-0.8, 1.35, 0]} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Coffee Cups */}
        <mesh position={[0.2, 1.25, 0.2]}>
          <cylinderGeometry args={[0.08, 0.06, 0.14, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.5, 1.25, -0.1]}>
          <cylinderGeometry args={[0.08, 0.06, 0.14, 12]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        {/* Neon Sign */}
        <mesh position={[0, 2.0, -1.3]}>
          <boxGeometry args={[1.8, 0.4, 0.05]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Vending Machine & Fridge */}
      <group position={[3.5, 0, -2.8]}>
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[1.2, 2.6, 1.0]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.3} />
        </mesh>
        {/* Glowing glass panel */}
        <mesh position={[0, 1.4, 0.51]}>
          <planeGeometry args={[0.9, 1.4]} />
          <meshStandardMaterial color="#fed7aa" emissive="#fb923c" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Dining Tables with Chairs */}
      {[-0.8, 1.6].map((tx, idx) => (
        <group key={idx} position={[tx, 0, -1.5]}>
          {/* Table */}
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.9, 0.9, 0.08, 24]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.6} />
          </mesh>
          {/* Chairs */}
          {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, cIdx) => (
            <group key={cIdx} position={[Math.cos(angle) * 1.1, 0, Math.sin(angle) * 1.1]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.4, 0.06, 0.4]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
              <mesh position={[0, 0.6, -0.17]}>
                <boxGeometry args={[0.4, 0.45, 0.05]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Chill Lounge Sofa & Plant */}
      <group position={[-1.0, 0, 2.0]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.5, 1.1]} />
          <meshStandardMaterial color="#0f766e" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.7, -0.45]}>
          <boxGeometry args={[2.8, 0.6, 0.25]} />
          <meshStandardMaterial color="#115e59" roughness={0.6} />
        </mesh>
      </group>

      {/* Decorative Indoor Plant */}
      <group position={[4.2, 0, 2.5]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.35, 0.25, 0.6, 16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// FL.03 Workspace Props
export function Floor03Workspace({ isVisible = true }) {
  if (!isVisible) return null;
  const y = FLOOR_HEIGHTS['FL.03'];

  return (
    <group position={[0, y, 0]}>
      <FloorBase y={0} color="#0f172a" label="FL.03" subtitle="Engineering & Operations" />

      {/* Row of Workstations (Top Row) */}
      {[-3.5, -1.0, 1.5].map((wx, idx) => (
        <group key={idx} position={[wx, 0, -2.2]}>
          {/* Desk */}
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.08, 1.0]} />
            <meshStandardMaterial color="#334155" roughness={0.3} />
          </mesh>
          {/* Desk legs */}
          <mesh position={[-0.8, 0.25, 0.4]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>
          <mesh position={[0.8, 0.25, 0.4]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>
          {/* Dual Monitor Stand */}
          <mesh position={[-0.35, 0.9, -0.25]} rotation={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.65, 0.42, 0.04]} />
            <meshStandardMaterial color="#0284c7" emissive="#0ea5e9" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.35, 0.9, -0.25]} rotation={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.65, 0.42, 0.04]} />
            <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.6} />
          </mesh>
          {/* Keyboard & Mousepad */}
          <mesh position={[0, 0.55, 0.15]}>
            <boxGeometry args={[0.5, 0.02, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Ergonomic Office Chair */}
          <group position={[0, 0, 0.6]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[0.5, 0.06, 0.5]} />
              <meshStandardMaterial color="#6366f1" />
            </mesh>
            <mesh position={[0, 0.75, 0.22]}>
              <boxGeometry args={[0.48, 0.6, 0.06]} />
              <meshStandardMaterial color="#4f46e5" />
            </mesh>
          </group>
        </group>
      ))}

      {/* Row of Workstations (Bottom Row) */}
      {[-3.5, -1.0].map((wx, idx) => (
        <group key={`b-${idx}`} position={[wx, 0, 1.8]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.08, 1.0]} />
            <meshStandardMaterial color="#334155" roughness={0.3} />
          </mesh>
          {/* Monitors facing up */}
          <mesh position={[0, 0.9, 0.25]} rotation={[0, Math.PI, 0]} castShadow>
            <boxGeometry args={[0.8, 0.45, 0.04]} />
            <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.6} />
          </mesh>
          {/* Chair */}
          <group position={[0, 0, -0.6]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[0.5, 0.06, 0.5]} />
              <meshStandardMaterial color="#ec4899" />
            </mesh>
            <mesh position={[0, 0.75, -0.22]}>
              <boxGeometry args={[0.48, 0.6, 0.06]} />
              <meshStandardMaterial color="#db2777" />
            </mesh>
          </group>
        </group>
      ))}

      {/* Server Rack Tower (Right Side) */}
      <group position={[3.8, 0, -2.0]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[1.2, 2.4, 0.9]} />
          <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Blinking server LED lights */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((ly, lIdx) => (
          <mesh key={lIdx} position={[0, 1.2 + ly, 0.46]}>
            <boxGeometry args={[0.9, 0.15, 0.02]} />
            <meshStandardMaterial
              color={lIdx % 2 === 0 ? '#10b981' : '#06b6d4'}
              emissive={lIdx % 2 === 0 ? '#10b981' : '#06b6d4'}
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
      </group>

      {/* Interactive Whiteboard / Kanban Stand */}
      <group position={[2.5, 0, 1.5]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2.2, 1.4, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Kanban sticky note mocks on whiteboard */}
        <mesh position={[-0.6, 1.4, 0.05]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
        <mesh position={[-0.1, 1.3, 0.05]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color="#93c5fd" />
        </mesh>
        <mesh position={[0.5, 1.2, 0.05]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color="#bbf7d0" />
        </mesh>
      </group>
    </group>
  );
}

// FL.04 Rooftop Lounge Props
export function Floor04Rooftop({ isVisible = true }) {
  if (!isVisible) return null;
  const y = FLOOR_HEIGHTS['FL.04'];

  return (
    <group position={[0, y, 0]}>
      {/* Wood deck style floor */}
      <FloorBase y={0} color="#334155" label="FL.04" subtitle="Rooftop Garden & Lounge" />

      {/* Rooftop Wooden Decking Pattern */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[10.6, 0.02, 8.1]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Rooftop Cocktail/Coffee Canopy Bar */}
      <group position={[-3.2, 0, -1.8]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.8, 1.2, 1.2]} />
          <meshStandardMaterial color="#047857" roughness={0.4} />
        </mesh>
        {/* Bar Canopy Canvas */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[3.2, 0.06, 1.6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.7} />
        </mesh>
        <mesh position={[-1.3, 1.1, 0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 2.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[1.3, 1.1, 0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 2.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Sun Loungers / Beanbags */}
      {[-0.8, 0.6].map((lx, idx) => (
        <group key={idx} position={[lx, 0, -2.0]} rotation={[0, Math.PI / 8, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[1.6, 0.25, 0.7]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[-0.6, 0.45, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.6, 0.15, 0.7]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}

      {/* Rooftop Telescope / Sky Viewer */}
      <group position={[3.5, 0, -1.5]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 1.2]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        <mesh position={[0.2, 1.2, 0]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 0.9, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
        </mesh>
      </group>

      {/* Garden Planters & Trees */}
      {[-2.8, 0.5, 3.2].map((px, idx) => (
        <group key={idx} position={[px, 0, 2.4]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.2, 0.7, 0.7]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <dodecahedronGeometry args={[0.55]} />
            <meshStandardMaterial color="#10b981" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Glowing Party Lights String */}
      <group position={[0, 2.6, 0]}>
        {[-3, -1.5, 0, 1.5, 3].map((lx, idx) => (
          <mesh key={idx} position={[lx, Math.sin(idx) * 0.15, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#f59e0b' : '#ec4899'}
              emissive={idx % 2 === 0 ? '#f59e0b' : '#ec4899'}
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
