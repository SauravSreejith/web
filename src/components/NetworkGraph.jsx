import { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import { networkNodes, networkEdges } from '../data/mockData';

const NetworkGraph = ({ 
  tissue = 'normal', 
  selectedGene, 
  onNodeClick, 
  highlightedGene,
  width = '100%',
  height = '100%'
}) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    const nodeColor = tissue === 'normal' ? '#00F0FF' : '#FF2D8D';
    const edgeColor = tissue === 'normal' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 45, 141, 0.25)';

    // Prepare elements
    const elements = [
      ...networkNodes.map(node => ({
        data: { 
          id: node.id, 
          label: node.label,
          group: node.group,
          size: node.size
        }
      })),
      ...networkEdges.map((edge, idx) => ({
        data: { 
          id: `e${idx}`, 
          source: edge.source, 
          target: edge.target, 
          weight: edge.weight 
        }
      }))
    ];

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': nodeColor,
            'width': (ele) => ele.data('size') || 16,
            'height': (ele) => ele.data('size') || 16,
            'label': (ele) => ele.data('label'),
            'color': '#F2F4F8',
            'font-size': '10px',
            'font-family': 'JetBrains Mono, monospace',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'text-background-color': '#0A0A0A',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px 4px',
            'text-background-shape': 'roundrectangle',
            'border-width': 0,
            'transition-property': 'background-color, border-width, border-color, width, height',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'node[group="top"]',
          style: {
            'width': (ele) => (ele.data('size') || 24) * 1.2,
            'height': (ele) => (ele.data('size') || 24) * 1.2,
            'font-size': '12px',
            'font-weight': 'bold'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#FFD166',
            'border-opacity': 1
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 3,
            'border-color': '#FFD166',
            'border-opacity': 1,
            'background-color': '#FFD166'
          }
        },
        {
          selector: 'node.neighbor',
          style: {
            'border-width': 2,
            'border-color': nodeColor,
            'border-opacity': 0.8
          }
        },
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.2
          }
        },
        {
          selector: 'edge',
          style: {
            'width': (ele) => Math.max(1, ele.data('weight') * 2),
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
            'target-arrow-shape': 'none',
            'curve-style': 'bezier',
            'opacity': 0.6,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#FFD166',
            'width': (ele) => Math.max(2, ele.data('weight') * 3),
            'opacity': 1
          }
        },
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.1
          }
        }
      ],
      layout: {
        name: 'cose',
        padding: 20,
        nodeRepulsion: 8000,
        nodeOverlap: 20,
        idealEdgeLength: 80,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 30,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
        fit: true,
        animate: true,
        animationDuration: 500
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3
    });

    // Add event listeners
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      onNodeClick?.(node.data('id'));
    });

    cyRef.current.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      node.animate({
        style: { 
          'width': (node.data('size') || 16) * 1.4,
          'height': (node.data('size') || 16) * 1.4
        }
      }, { duration: 200 });
    });

    cyRef.current.on('mouseout', 'node', (evt) => {
      const node = evt.target;
      if (!node.selected()) {
        node.animate({
          style: { 
            'width': node.data('size') || 16,
            'height': node.data('size') || 16
          }
        }, { duration: 200 });
      }
    });

    // Run layout
    cyRef.current.layout({
      name: 'cose',
      padding: 30,
      nodeRepulsion: 10000,
      nodeOverlap: 10,
      idealEdgeLength: 100,
      edgeElasticity: 150,
      nestingFactor: 5,
      gravity: 40,
      numIter: 1500,
      initialTemp: 300,
      coolingFactor: 0.92,
      minTemp: 0.5,
      fit: true,
      animate: true,
      animationDuration: 800,
      randomize: false,
      componentSpacing: 100,
      uniformNodeDimensions: false
    }).run();

    setIsReady(true);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [tissue]); // Re-initialize when tissue changes

  // Update colors when tissue changes
  useEffect(() => {
    if (!cyRef.current || !isReady) return;

    const nodeColor = tissue === 'normal' ? '#00F0FF' : '#FF2D8D';
    const edgeColor = tissue === 'normal' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 45, 141, 0.25)';

    cyRef.current.style()
      .selector('node')
      .style({ 'background-color': nodeColor })
      .selector('node.neighbor')
      .style({ 'border-color': nodeColor })
      .selector('edge')
      .style({ 
        'line-color': edgeColor,
        'target-arrow-color': edgeColor
      })
      .update();
  }, [tissue, isReady]);

  // Handle selected gene
  useEffect(() => {
    if (!cyRef.current || !isReady) return;

    // Clear previous selection
    cyRef.current.nodes().removeClass(['highlighted', 'neighbor', 'dimmed']);
    cyRef.current.edges().removeClass(['highlighted', 'dimmed']);
    cyRef.current.nodes().unselect();

    if (selectedGene) {
      const selectedNode = cyRef.current.getElementById(selectedGene);
      
      if (selectedNode.length > 0) {
        // Select and highlight the node
        selectedNode.select();
        selectedNode.addClass('highlighted');

        // Get neighbors
        const neighbors = selectedNode.neighborhood();
        neighbors.nodes().addClass('neighbor');
        neighbors.edges().addClass('highlighted');

        // Dim other elements
        cyRef.current.nodes().not(selectedNode).not(neighbors.nodes()).addClass('dimmed');
        cyRef.current.edges().not(neighbors.edges()).addClass('dimmed');

        // Center on selected node
        cyRef.current.animate({
          fit: {
            eles: selectedNode.union(neighbors),
            padding: 80
          }
        }, { duration: 500 });
      }
    }
  }, [selectedGene, isReady]);

  // Handle highlighted gene from leaderboard
  useEffect(() => {
    if (!cyRef.current || !isReady || !highlightedGene) return;

    const node = cyRef.current.getElementById(highlightedGene);
    if (node.length > 0) {
      node.animate({
        style: { 
          'width': (node.data('size') || 16) * 1.6,
          'height': (node.data('size') || 16) * 1.6
        }
      }, { duration: 200 });

      // Flash effect
      const originalColor = tissue === 'normal' ? '#00F0FF' : '#FF2D8D';
      node.animate({
        style: { 'background-color': '#FFD166' }
      }, { duration: 150 })
      .animate({
        style: { 'background-color': originalColor }
      }, { duration: 150 })
      .animate({
        style: { 'background-color': '#FFD166' }
      }, { duration: 150 })
      .animate({
        style: { 'background-color': originalColor }
      }, { duration: 150 });

      return () => {
        if (node.length > 0) {
          node.stop();
          node.animate({
            style: { 
              'width': node.data('size') || 16,
              'height': node.data('size') || 16,
              'background-color': originalColor
            }
          }, { duration: 200 });
        }
      };
    }
  }, [highlightedGene, tissue, isReady]);

  const handleReset = useCallback(() => {
    if (!cyRef.current) return;
    
    cyRef.current.nodes().removeClass(['highlighted', 'neighbor', 'dimmed']);
    cyRef.current.edges().removeClass(['highlighted', 'dimmed']);
    cyRef.current.nodes().unselect();
    
    cyRef.current.animate({
      fit: { padding: 30 }
    }, { duration: 500 });
    
    onNodeClick?.(null);
  }, [onNodeClick]);

  const handleZoomIn = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ width, height }}
      />
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-lg glass-card-sm flex items-center justify-center
                     text-[#A6AEB8] hover:text-[#00F0FF] hover:border-[#00F0FF]/30
                     transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-lg glass-card-sm flex items-center justify-center
                     text-[#A6AEB8] hover:text-[#00F0FF] hover:border-[#00F0FF]/30
                     transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-lg glass-card-sm flex items-center justify-center
                     text-[#A6AEB8] hover:text-[#00F0FF] hover:border-[#00F0FF]/30
                     transition-all duration-200"
          title="Reset view"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-card-sm px-4 py-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tissue === 'normal' ? '#00F0FF' : '#FF2D8D' }}
            />
            <span className="text-[#A6AEB8]">Network Gene</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#FFD166]" />
            <span className="text-[#A6AEB8]">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
