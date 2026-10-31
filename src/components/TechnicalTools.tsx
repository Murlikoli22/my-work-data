import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Calculator, 
  Zap, 
  Layers, 
  Wrench,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { TechnicalWindingDatabaseEntry } from '../types';
import { SWG_WIRE_TABLE } from '../utils/seedData';

interface TechnicalToolsProps {
  database: TechnicalWindingDatabaseEntry[];
  onAddEntry: (entry: TechnicalWindingDatabaseEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const TechnicalTools: React.FC<TechnicalToolsProps> = ({
  database,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'swg_calc' | 'fla_calc'>('bank');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // SWG Calculator state
  const [targetSWG, setTargetSWG] = useState<number>(20);
  const [parallelCount, setParallelCount] = useState<number>(2);

  // Full Load Current Calculator state
  const [calcHp, setCalcHp] = useState<number>(7.5);
  const [calcVoltage, setCalcVoltage] = useState<number>(415);
  const [calcPhase, setCalcPhase] = useState<'3' | '1'>('3');
  const [calcPf, setCalcPf] = useState<number>(0.85);
  const [calcEff, setCalcEff] = useState<number>(0.88);

  // Form for New Winding Entry
  const [brand, setBrand] = useState('Crompton Greaves');
  const [hp, setHp] = useState<number>(5);
  const [phase, setPhase] = useState<'Single Phase (1Φ)' | 'Three Phase (3Φ)'>('Three Phase (3Φ)');
  const [rpm, setRpm] = useState<number>(1440);
  const [poles, setPoles] = useState<number>(4);
  const [slots, setSlots] = useState<number>(36);
  const [totalCoils, setTotalCoils] = useState<number>(18);
  const [coilPitch, setCoilPitch] = useState('1-8, 1-10, 1-12');
  const [turns, setTurns] = useState('38, 40, 42 Turns');
  const [swg, setSwg] = useState('21 SWG');
  const [copperWeight, setCopperWeight] = useState<number>(4.2);
  const [connection, setConnection] = useState('Delta (Δ)');
  const [bearings, setBearings] = useState('6207 ZZ / 6206 ZZ');
  const [notes, setNotes] = useState('');

  // SWG Equivalent Calculations
  const targetWire = SWG_WIRE_TABLE.find(w => w.swg === targetSWG) || SWG_WIRE_TABLE[6]; // 20 SWG
  const requiredArea = targetWire.areaSqMm;
  const targetAreaPerWire = requiredArea / parallelCount;

  // Find closest SWG wires
  const closestEquivalent = SWG_WIRE_TABLE.reduce((prev, curr) => 
    Math.abs(curr.areaSqMm - targetAreaPerWire) < Math.abs(prev.areaSqMm - targetAreaPerWire) ? curr : prev
  );

  // FLA Calculation
  const powerWatts = calcHp * 745.7;
  const calculatedFLA = calcPhase === '3'
    ? powerWatts / (1.73205 * calcVoltage * calcPf * calcEff)
    : powerWatts / (calcVoltage * calcPf * calcEff);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TechnicalWindingDatabaseEntry = {
      id: `tw-${Date.now()}`,
      brand,
      hp,
      kw: Number((hp * 0.7457).toFixed(2)),
      phase,
      rpm,
      poles,
      slots,
      totalCoils,
      coilPitch,
      turns,
      swg,
      parallelWires: 1,
      copperWeightApproxKg: copperWeight,
      connection: connection as any,
      bearings,
      notes
    };
    onAddEntry(newEntry);
    setShowAddModal(false);
  };

  const filteredData = database.filter(d => 
    d.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${d.hp} HP`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.swg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.turns.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-12 text-slate-100">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Technical Engineering Suite
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Motor Winding Data Bank & SWG Wire Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Original factory winding turns, gauge, coil pitch, connection reference and parallel wire replacement calculator.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Factory Winding Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'bank' ? 'bg-slate-800 text-white border border-slate-700 shadow-xs' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Motor Winding Reference Library ({database.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('swg_calc')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'swg_calc' ? 'bg-slate-800 text-white border border-slate-700 shadow-xs' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>SWG Gauge Parallel Wire Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('fla_calc')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'fla_calc' ? 'bg-slate-800 text-white border border-slate-700 shadow-xs' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>Full Load Amps (FLA) & Power Calculator</span>
        </button>
      </div>

      {/* TAB 1: WINDING DATA BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by brand, HP (e.g. 7.5 HP), SWG, turns..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Showing {filteredData.length} motor blueprints
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 relative group hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 block">{item.brand}</span>
                    <h3 className="font-extrabold text-white text-base">
                      {item.hp} HP ({item.kw} kW) • {item.phase.includes('Three') ? '3Φ' : '1Φ'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {item.rpm} RPM ({item.poles} Poles) • {item.slots} Slots
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteEntry(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    title="Delete Blueprint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coil Turns:</span>
                    <span className="font-mono font-bold text-white">{item.turns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wire Gauge (SWG):</span>
                    <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-1 rounded border border-amber-900/60">{item.swg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Coils:</span>
                    <span className="font-mono font-bold text-slate-200">{item.totalCoils || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coil Pitch:</span>
                    <span className="font-mono text-slate-300">{item.coilPitch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Connection:</span>
                    <span className="font-semibold text-white">{item.connection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Approx Copper Wt:</span>
                    <span className="font-bold text-white">{item.copperWeightApproxKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bearings:</span>
                    <span className="font-mono text-[11px] text-slate-300">{item.bearings}</span>
                  </div>
                  {item.capacitor && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacitor:</span>
                      <span className="font-medium text-slate-200">{item.capacitor}</span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-400 italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SWG GAUGE PARALLEL WIRE CALCULATOR */}
      {activeTab === 'swg_calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-white">
                SWG Parallel Wire Substitution Calculator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Motor rewinders often do not have thick wire in stock. This tool calculates which 2 or 3 thinner parallel wires equal the exact cross-sectional area of a single thick wire.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Single Wire (SWG):</label>
                <select
                  value={targetSWG}
                  onChange={(e) => setTargetSWG(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 font-bold text-amber-300 focus:border-amber-500 focus:outline-hidden"
                >
                  {SWG_WIRE_TABLE.map(w => (
                    <option key={w.swg} value={w.swg}>{w.swg} SWG ({w.diameterMm} mm • {w.areaSqMm} mm²)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Substitute With:</label>
                <select
                  value={parallelCount}
                  onChange={(e) => setParallelCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-slate-200 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value={2}>2 Parallel Wires (Double Wire)</option>
                  <option value={3}>3 Parallel Wires (Triple Wire)</option>
                  <option value={4}>4 Parallel Wires (Quad Wire)</option>
                </select>
              </div>
            </div>

            {/* Calculated Recommendation Box */}
            <div className="bg-amber-950/40 border border-amber-900/70 rounded-2xl p-5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                Recommended Equivalent Replacement:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-300">
                  {parallelCount === 2 ? 'Double' : parallelCount === 3 ? 'Triple' : `${parallelCount}x`} {closestEquivalent.swg} SWG
                </span>
                <span className="text-xs font-semibold text-amber-400/80">
                  ({closestEquivalent.diameterMm} mm)
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-amber-900/60">
                <p>Original Area (1 x {targetWire.swg} SWG): <strong className="text-white">{targetWire.areaSqMm.toFixed(4)} mm²</strong></p>
                <p>
                  New Combined Area ({parallelCount} x {closestEquivalent.swg} SWG):{' '}
                  <strong className="text-white">{(closestEquivalent.areaSqMm * parallelCount).toFixed(4)} mm²</strong>
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Area Match Accuracy: {(100 - Math.abs(((closestEquivalent.areaSqMm * parallelCount - targetWire.areaSqMm) / targetWire.areaSqMm) * 100)).toFixed(1)}% match!
                </p>
              </div>
            </div>
          </div>

          {/* Quick SWG Reference Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-white">Standard Wire Gauge (SWG) Table</h4>
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950">
                    <th className="py-2 px-3">SWG</th>
                    <th className="py-2 px-3">Diameter (mm)</th>
                    <th className="py-2 px-3">Area (mm²)</th>
                    <th className="py-2 px-3 text-right">Max Current (A)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {SWG_WIRE_TABLE.map(w => (
                    <tr key={w.swg} className={w.swg === targetSWG ? 'bg-amber-950/60 text-amber-300 font-bold' : 'text-slate-300'}>
                      <td className="py-1.5 px-3">{w.swg} SWG</td>
                      <td className="py-1.5 px-3">{w.diameterMm}</td>
                      <td className="py-1.5 px-3">{w.areaSqMm}</td>
                      <td className="py-1.5 px-3 text-right">{w.currentRatingAmps} A</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FLA & MOTOR RATING CALCULATOR */}
      {activeTab === 'fla_calc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-5">
          <div>
            <h3 className="font-bold text-base text-white">
              Full Load Current (FLA) & Starting Amps Calculator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Calculate expected ampere rating to test motor on trial bench and calibrate overload thermal relays.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Motor Rating (HP):</label>
              <input
                type="number"
                step="0.5"
                value={calcHp}
                onChange={(e) => setCalcHp(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-bold text-base text-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Equivalent kW:</label>
              <div className="px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 font-bold text-base text-slate-300">
                {(calcHp * 0.7457).toFixed(2)} kW
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Phase:</label>
              <select
                value={calcPhase}
                onChange={(e) => {
                  setCalcPhase(e.target.value as any);
                  if (e.target.value === '1') setCalcVoltage(230);
                  else setCalcVoltage(415);
                }}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-white focus:border-amber-500 focus:outline-hidden"
              >
                <option value="3">Three Phase (3Φ)</option>
                <option value="1">Single Phase (1Φ)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Voltage (V):</label>
              <input
                type="number"
                value={calcVoltage}
                onChange={(e) => setCalcVoltage(parseFloat(e.target.value) || 415)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-slate-950 border border-slate-800 text-white rounded-2xl p-5 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expected Full Load Amps</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {calculatedFLA.toFixed(1)} A
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">No-Load Test Range</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {(calculatedFLA * 0.35).toFixed(1)} - {(calculatedFLA * 0.45).toFixed(1)} A
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">DOL Starting Current (6x)</span>
              <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">
                {(calculatedFLA * 6).toFixed(0)} A
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD FACTORY BLUEPRINT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">Add Factory Motor Winding Blueprint</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Make / Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">HP</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hp}
                    onChange={(e) => setHp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-bold text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phase</label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-950 text-white focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="Three Phase (3Φ)">Three Phase (3Φ)</option>
                    <option value="Single Phase (1Φ)">Single Phase (1Φ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">RPM</label>
                  <input
                    type="number"
                    value={rpm}
                    onChange={(e) => setRpm(parseInt(e.target.value) || 1440)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Slots</label>
                  <input
                    type="number"
                    value={slots}
                    onChange={(e) => setSlots(parseInt(e.target.value) || 36)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Total Coils</label>
                  <input
                    type="number"
                    value={totalCoils}
                    onChange={(e) => setTotalCoils(parseInt(e.target.value) || 18)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Coil Turns</label>
                  <input
                    type="text"
                    required
                    value={turns}
                    onChange={(e) => setTurns(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Wire Gauge (SWG)</label>
                  <input
                    type="text"
                    required
                    value={swg}
                    onChange={(e) => setSwg(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Coil Pitch</label>
                  <input
                    type="text"
                    value={coilPitch}
                    onChange={(e) => setCoilPitch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Connection</label>
                  <input
                    type="text"
                    value={connection}
                    onChange={(e) => setConnection(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Approx Copper (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={copperWeight}
                    onChange={(e) => setCopperWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-bold text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bearings</label>
                  <input
                    type="text"
                    value={bearings}
                    onChange={(e) => setBearings(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Special Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Submersible poly wire, double layer lap winding..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer"
                >
                  Save to Data Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
