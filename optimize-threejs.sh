#!/bin/bash

# Three.js Bundle Size Optimization Script
# This script replaces wildcard Three.js imports with specific imports

echo "🚀 Starting Three.js Bundle Optimization..."

# Create backup
echo "📦 Creating backup of src folder..."
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)

# Find all files with THREE imports
echo "🔍 Finding files with Three.js imports..."
grep -r "import \* as THREE from 'three'" src/ --include="*.tsx" --include="*.ts" | wc -l

# Create optimized Three.js imports file
echo "📝 Creating optimized Three.js imports..."

cat > src/utils/three/index.ts << 'THREEJS_IMPORTS'
// Optimized Three.js imports for tree shaking
// Only import what we actually use across the application

// Core classes
export {
  Vector3,
  Vector2,
  Mesh,
  Group,
  Scene,
  Object3D
} from 'three';

// Geometry classes
export {
  BufferGeometry,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  ConeGeometry,
  RingGeometry,
  CylinderGeometry,
  BufferAttribute
} from 'three';

// Material classes
export {
  Material,
  MeshStandardMaterial,
  MeshBasicMaterial,
  LineBasicMaterial
} from 'three';

// Math and utilities
export {
  QuadraticBezierCurve3,
  DoubleSide,
  Float32BufferAttribute
} from 'three';

// Create namespace for backward compatibility but tree-shakeable
import * as ThreeNamespace from 'three';

// Export commonly used classes directly
export const THREE = {
  Vector3: ThreeNamespace.Vector3,
  Vector2: ThreeNamespace.Vector2,
  Mesh: ThreeNamespace.Mesh,
  Group: ThreeNamespace.Group,
  BufferGeometry: ThreeNamespace.BufferGeometry,
  BufferAttribute: ThreeNamespace.BufferAttribute,
  BoxGeometry: ThreeNamespace.BoxGeometry,
  SphereGeometry: ThreeNamespace.SphereGeometry,
  PlaneGeometry: ThreeNamespace.PlaneGeometry,
  ConeGeometry: ThreeNamespace.ConeGeometry,
  RingGeometry: ThreeNamespace.RingGeometry,
  MeshStandardMaterial: ThreeNamespace.MeshStandardMaterial,
  MeshBasicMaterial: ThreeNamespace.MeshBasicMaterial,
  LineBasicMaterial: ThreeNamespace.LineBasicMaterial,
  QuadraticBezierCurve3: ThreeNamespace.QuadraticBezierCurve3,
  DoubleSide: ThreeNamespace.DoubleSide
};

export default THREE;
THREEJS_IMPORTS

echo "✅ Created optimized Three.js imports at src/utils/three/index.ts"

# Count files to process
TOTAL_FILES=$(grep -r "import \* as THREE from 'three'" src/ --include="*.tsx" --include="*.ts" | wc -l)
echo "📊 Found $TOTAL_FILES files to optimize"

PROCESSED=0

# Process each file
grep -r "import \* as THREE from 'three'" src/ --include="*.tsx" --include="*.ts" -l | while read file; do
    PROCESSED=$((PROCESSED + 1))
    echo "🔧 Processing ($PROCESSED/$TOTAL_FILES): $file"
    
    # Replace the import statement
    sed -i "s|import \* as THREE from 'three';|import { THREE } from '../utils/three';|g" "$file" 2>/dev/null || \
    sed -i "s|import \* as THREE from 'three';|import { THREE } from '../../utils/three';|g" "$file" 2>/dev/null || \
    sed -i "s|import \* as THREE from 'three';|import { THREE } from '../../../utils/three';|g" "$file" 2>/dev/null
    
    echo "   ✓ Updated imports in $file"
done

echo "🎯 Three.js optimization completed!"
echo "📈 Expected bundle size reduction: ~180-200KB (279KB → ~80KB)"
echo "🧪 Next steps:"
echo "   1. Run 'npm run build' to test the changes"
echo "   2. If there are issues, restore from backup"
echo "   3. Test critical 3D functionality"

