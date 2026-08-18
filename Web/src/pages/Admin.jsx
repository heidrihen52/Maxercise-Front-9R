import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Plus, Notebook, Barbell, FolderOpen, PencilSimpleLine, Users, ShieldCheck,
         BookOpen, PencilLine, Trash, X, Check, Eye, House, SignOut, CaretRight,
         ListBullets, Rows, Brain, HeartBreak, Pulse, Database, UploadSimple, DownloadSimple, Broom } from '@phosphor-icons/react';
import { io } from 'socket.io-client';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import * as am5radar from '@amcharts/amcharts5/radar';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { adminAPI, aiAPI } from '../services/api';
import './Admin.css';

const ROUTINE_CATS = [
  { id:'upper', label:'Tren superior' }, { id:'lower', label:'Tren inferior' },
  { id:'core', label:'Core' }, { id:'full_body', label:'Cuerpo completo' },
  { id:'cardio', label:'Cardio' }, { id:'mobility', label:'Movilidad' },
];

const emptyEx = { name:'', description:'', instructions:'', muscleGroup:'chest', bodyArea:'upper', difficulty:'beginner', equipment:'', image:'' };
const emptyRt = { name:'', description:'', level:'beginner', duration:'', frequency:'', category:'full_body', image:'', selectedExercises:[] };

// ─── AMCHARTS COMPONENTS ──────────────────────────────────────

function AmChartsBar({ data }) {
  const chartRef = useRef(null);
  
  useLayoutEffect(() => {
    let root = am5.Root.new("am5-bar-chart");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 10
      })
    );

    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
    xRenderer.labels.template.setAll({
      centerY: am5.p50,
      centerX: am5.p50,
      paddingRight: 15
    });

    xRenderer.grid.template.setAll({ location: 1 });

    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: "name",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 })
      })
    );

    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Totales",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        sequencedInterpolation: true,
        categoryXField: "name",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}"
        })
      })
    );

    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
    series.columns.template.adapters.add("fill", function(fill, target) {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });
    series.columns.template.adapters.add("stroke", function(stroke, target) {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });

    xAxis.data.setAll(data);
    series.data.setAll(data);
    
    series.appear(1000);
    chart.appear(1000, 100);

    chartRef.current = root;

    return () => {
      root.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    if (chartRef.current) {
       let chart = chartRef.current.container.children.getIndex(0);
       let xAxis = chart.xAxes.getIndex(0);
       let series = chart.series.getIndex(0);
       xAxis.data.setAll(data);
       series.data.setAll(data);
    }
  }, [data]);

  return <div id="am5-bar-chart" style={{ width: "100%", height: "350px" }} />;
}

function AmChartsPie({ data, id = "am5-pie-chart" }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    let root = am5.Root.new(id);
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(50)
      })
    );

    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "count",
        categoryField: "name",
        alignLabels: false
      })
    );
    
    series.labels.template.setAll({
      forceHidden: true
    });
    series.ticks.template.setAll({
      forceHidden: true
    });

    series.data.setAll(data);

    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
      marginBottom: 15
    }));
    legend.data.setAll(series.dataItems);

    series.appear(1000, 100);

    chartRef.current = root;

    return () => {
      root.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    if (chartRef.current) {
      let chart = chartRef.current.container.children.getIndex(0);
      let series = chart.series.getIndex(0);
      series.data.setAll(data);
      let legend = chart.children.getIndex(1);
      legend.data.setAll(series.dataItems);
    }
  }, [data]);

  return <div id={id} style={{ width: "100%", height: "350px" }} />;
}

function AmChartsGauge({ value }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    let root = am5.Root.new("am5-gauge-chart");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      startAngle: 180,
      endAngle: 360
    }));

    let axisRenderer = am5radar.AxisRendererCircular.new(root, {
      innerRadius: -40
    });
    axisRenderer.grid.template.setAll({ stroke: root.interfaceColors.get("background"), visible: true, strokeOpacity: 0.8 });

    let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min: 0,
      max: 100,
      strictMinMax: true,
      renderer: axisRenderer
    }));

    let axisDataItem = xAxis.makeDataItem({});
    let clockHand = am5radar.ClockHand.new(root, {
      pinRadius: am5.percent(20),
      radius: am5.percent(100),
      bottomWidth: 40
    });
    
    let bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(root, {
      sprite: clockHand
    }));

    xAxis.createAxisRange(axisDataItem);

    let label = chart.radarContainer.children.push(am5.Label.new(root, {
      fill: am5.color(0x3b82f6),
      centerX: am5.percent(50),
      textAlign: "center",
      centerY: am5.percent(50),
      fontSize: "3em",
      fontWeight: "bold"
    }));
    
    axisDataItem.set("value", 0);
    label.set("text", "0%");

    chartRef.current = { root, axisDataItem, label };

    return () => {
      root.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    if (chartRef.current) {
      let { axisDataItem, label } = chartRef.current;
      axisDataItem.animate({
        key: "value",
        to: value,
        duration: 500,
        easing: am5.ease.out(am5.ease.cubic)
      });
      label.set("text", Math.round(value) + "%");
    }
  }, [value]);

  return <div id="am5-gauge-chart" style={{ width: "100%", height: "250px" }} />;
}
// ─── AmChartsRadar ──────────────────────────────────────────
function AmChartsRadar({ data }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    let root = am5.Root.new("am5-radar-chart");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none"
    }));

    let xRenderer = am5radar.AxisRendererCircular.new(root, {});
    xRenderer.labels.template.setAll({ radius: 10 });
    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "category",
      renderer: xRenderer
    }));

    let yRenderer = am5radar.AxisRendererRadial.new(root, {});
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: yRenderer
    }));

    let series = chart.series.push(am5radar.RadarLineSeries.new(root, {
      name: "Usuarios",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      categoryXField: "category",
      tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
    }));

    series.strokes.template.setAll({ strokeWidth: 2 });
    series.fills.template.setAll({ fillOpacity: 0.2, visible: true });
    
    // Add legend
    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
      marginBottom: 15
    }));
    legend.data.setAll(series.dataItems);

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);

    chartRef.current = root;
    return () => root.dispose();
  }, [data]);

  return <div id="am5-radar-chart" style={{ width: "100%", height: "350px" }} />;
}

// ─── AmChartsArea ───────────────────────────────────────────
function AmChartsArea({ data }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    let root = am5.Root.new("am5-area-chart");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout
    }));

    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));

    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "day", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Registros",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
    }));

    series.fills.template.setAll({
      fillOpacity: 0.2,
      visible: true
    });
    series.strokes.template.setAll({
      strokeWidth: 2
    });

    series.data.setAll(data);
    series.appear(1000);
    chart.appear(1000, 100);

    chartRef.current = root;
    return () => root.dispose();
  }, [data]);

  return <div id="am5-area-chart" style={{ width: "100%", height: "350px" }} />;
}

// ─── AmChartsFunnel ─────────────────────────────────────────
function AmChartsFunnel({ data }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    let root = am5.Root.new("am5-funnel-chart");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5percent.SlicedChart.new(root, {
        layout: root.verticalLayout
      })
    );

    let series = chart.series.push(
      am5percent.FunnelSeries.new(root, {
        alignLabels: true,
        orientation: "vertical",
        valueField: "value",
        categoryField: "category",
        bottomRatio: 1
      })
    );

    // Add legend
    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
      marginBottom: 15
    }));
    legend.data.setAll(series.dataItems);

    series.data.setAll(data);
    series.appear(1000);
    chart.appear(1000, 100);

    chartRef.current = root;
    return () => root.dispose();
  }, [data]);

  return <div id="am5-funnel-chart" style={{ width: "100%", height: "350px" }} />;
}

// ─── Inline Edit Form ─────────────────────────────────────────

function EditExerciseForm({ item, onSave, onCancel }) {
  const { metadata } = useData();
  const MUSCLE_GROUPS = metadata?.muscleGroups || [];
  const DIFFICULTY_LEVELS = metadata?.difficultyLevels || [];

  const [form, setForm] = useState({
    name: item.name || item.title || '',
    description: item.description || '',
    instructions: item.instructions || (item.steps ? item.steps[0] : ''),
    muscleGroup: item.muscleGroup || item.muscle_group || 'chest',
    bodyArea: item.bodyArea || item.body_area || 'upper',
    difficulty: item.difficulty || 'beginner',
    equipment: item.equipment || '',
    image: item.image || '',
  });
  return (
    <div className="admin-edit-form">
      <div className="form-group"><label className="form-label">Nombre *</label>
        <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Descripción *</label>
        <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Instrucciones *</label>
        <textarea className="form-input" rows={2} value={form.instructions} onChange={e => setForm(p => ({...p, instructions:e.target.value}))} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Grupo muscular</label>
          <select className="form-input" value={form.muscleGroup} onChange={e => setForm(p => ({...p, muscleGroup:e.target.value}))}>
            {MUSCLE_GROUPS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Dificultad</label>
          <select className="form-input" value={form.difficulty} onChange={e => setForm(p => ({...p, difficulty:e.target.value}))}>
            {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select></div>
      </div>
      <div className="form-group"><label className="form-label">Equipo</label>
        <input className="form-input" value={form.equipment} onChange={e => setForm(p => ({...p, equipment:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">URL imagen</label>
        <input className="form-input" value={form.image} onChange={e => setForm(p => ({...p, image:e.target.value}))} /></div>
      <div className="admin-edit-actions">
        <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>
          <Check size={14} weight="bold" /> Guardar cambios
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          <X size={14} weight="bold" /> Cancelar
        </button>
      </div>
    </div>
  );
}

function EditRoutineForm({ item, associationRules = [], onSave, onCancel }) {
  const { exercises, metadata } = useData();
  const DIFFICULTY_LEVELS = metadata?.difficultyLevels || [];
  const allExercises = exercises || [];

  const [form, setForm] = useState({
    name: item.name || '',
    description: item.description || '',
    level: item.level || 'beginner',
    duration: item.duration || '',
    frequency: item.frequency || '',
    category: item.category || 'full_body',
    image: item.image || '',
    selectedExercises: (item.exercises || []).map(re => {
      const ex = allExercises.find(e => e.id === (re.exercise_id || re.exerciseId || re));
      return {
        exercise_id: re.exercise_id || re.exerciseId || re,
        name: ex ? ex.name : 'Ejercicio no encontrado',
        reps: re.reps || 10,
        sets: re.sets || 3,
        day_number: re.day_number || 1
      };
    })
  });
  return (
    <div className="admin-edit-form">
      <div className="form-group"><label className="form-label">Nombre *</label>
        <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Descripción *</label>
        <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Nivel</label>
          <select className="form-input" value={form.level} onChange={e => setForm(p => ({...p, level:e.target.value}))}>
            {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Categoría</label>
          <select className="form-input" value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
            {ROUTINE_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Duración</label>
          <input className="form-input" value={form.duration} onChange={e => setForm(p => ({...p, duration:e.target.value}))} placeholder="Ej: 45 min" /></div>
        <div className="form-group"><label className="form-label">Frecuencia</label>
          <input className="form-input" value={form.frequency} onChange={e => setForm(p => ({...p, frequency:e.target.value}))} placeholder="Ej: 3x/semana" /></div>
      </div>
      <div className="form-group"><label className="form-label">URL imagen</label>
        <input className="form-input" value={form.image} onChange={e => setForm(p => ({...p, image:e.target.value}))} /></div>
      
      <div className="form-group" style={{ marginTop: '0.75rem' }}>
        <label className="form-label">Ejercicios en esta rutina ({form.selectedExercises.length})</label>
        <select
          className="form-input"
          defaultValue=""
          onChange={(e) => {
            const exId = parseInt(e.target.value);
            if (exId) {
              const ex = allExercises.find(ex => ex.id === exId);
              if (ex && !form.selectedExercises.some(se => se.exercise_id === exId)) {
                setForm(p => ({
                  ...p,
                  selectedExercises: [
                    ...p.selectedExercises,
                    { exercise_id: exId, name: ex.name, reps: 10, sets: 3, day_number: 1 }
                  ]
                }));
              }
              e.target.value = "";
            }
          }}
        >
          <option value="" disabled>-- Selecciona un ejercicio para añadir --</option>
          {allExercises.map(ex => (
            <option key={ex.id} value={ex.id} disabled={form.selectedExercises.some(se => se.exercise_id === ex.id)}>
              {ex.name}
            </option>
          ))}
        </select>

        {/* 💡 Sugerencias de IA (Market Basket / Reglas de Asociación) */}
        {associationRules.length > 0 && (
          <div className="ai-suggestions-panel" style={{
            marginTop: '10px',
            padding: '12px',
            background: 'var(--blue-pale)',
            border: '1px dashed var(--blue-primary)',
            borderRadius: 'var(--radius-md)'
          }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700 }}>
              <Brain size={16} weight="fill" /> Sugerencias de Asociación (IA)
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {associationRules
                .filter(rule => {
                  if (form.selectedExercises.length === 0) return true;
                  return form.selectedExercises.some(se => se.exercise_id === rule.antecedent_id);
                })
                .slice(0, 3)
                .map((rule, index) => {
                  const ant = allExercises.find(e => e.id === rule.antecedent_id);
                  const cons = allExercises.find(e => e.id === rule.consequent_id);
                  if (!ant || !cons) return null;
                  const isAlreadySelected = form.selectedExercises.some(se => se.exercise_id === cons.id);

                  return (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'white',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(26, 111, 212, 0.15)',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ color: 'var(--gray-700)' }}>
                        Frecuente con <strong>{ant?.name}</strong>: <strong>{cons?.name}</strong> (Confianza: {Math.round(rule.confidence * 100)}%)
                      </span>
                      {!isAlreadySelected && (
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          style={{ padding: '2px 8px', fontSize: '0.75rem', height: '24px', display: 'flex', alignItems: 'center' }}
                          onClick={() => {
                            setForm(p => ({
                              ...p,
                              selectedExercises: [
                                ...p.selectedExercises,
                                { exercise_id: cons.id, name: cons.name, reps: 10, sets: 3, day_number: 1 }
                              ]
                            }));
                          }}
                        >
                          + Añadir
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {form.selectedExercises.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--gray-50)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginTop: '8px' }}>
            {form.selectedExercises.map((se, idx) => (
              <div key={se.exercise_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'white', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-100)', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', flex: 1, minWidth: '130px' }}>{se.name}</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Sets:</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '45px', padding: '4px', fontSize: '0.8rem', textAlign: 'center' }}
                      value={se.sets}
                      min={1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setForm(p => {
                          const updated = [...p.selectedExercises];
                          updated[idx] = { ...updated[idx], sets: val };
                          return { ...p, selectedExercises: updated };
                        });
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Reps:</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '45px', padding: '4px', fontSize: '0.8rem', textAlign: 'center' }}
                      value={se.reps}
                      min={1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setForm(p => {
                          const updated = [...p.selectedExercises];
                          updated[idx] = { ...updated[idx], reps: val };
                          return { ...p, selectedExercises: updated };
                        });
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Día:</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '45px', padding: '4px', fontSize: '0.8rem', textAlign: 'center' }}
                      value={se.day_number}
                      min={1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setForm(p => {
                          const updated = [...p.selectedExercises];
                          updated[idx] = { ...updated[idx], day_number: val };
                          return { ...p, selectedExercises: updated };
                        });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)', padding: '2px 4px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setForm(p => ({
                        ...p,
                        selectedExercises: p.selectedExercises.filter(item => item.exercise_id !== se.exercise_id)
                      }));
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-edit-actions">
        <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>
          <Check size={14} weight="bold" /> Guardar cambios
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          <X size={14} weight="bold" /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function Admin() {
  const { exercises, routines, metadata, saveAdminItem, deleteAdminItem, updateAdminItem, loadContent } = useData();
  const MUSCLE_GROUPS = metadata?.muscleGroups || [];
  const BODY_AREAS = metadata?.bodyAreas || [];
  const DIFFICULTY_LEVELS = metadata?.difficultyLevels || [];
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('create-exercise');
  const [exForm, setExForm] = useState(emptyEx);
  const [rtForm, setRtForm] = useState(emptyRt);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [churnData, setChurnData] = useState([]);
  const [anomaliesData, setAnomaliesData] = useState([]);
  const [associationRules, setAssociationRules] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [editingId, setEditingId] = useState(null); // id del item en edición
  const [dbMetrics, setDbMetrics] = useState({ users: 0, exercises: 0, routines: 0, restrictions: 0 });
  const [seedProgress, setSeedProgress] = useState(null);
  const roomId = "admin-seed-room-" + (currentUser?.id || "default");

  const flash = (m, type = 'success') => { setMsg(m); setMsgType(type); setTimeout(() => setMsg(''), 3500); };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchUsers = () => {
    adminAPI.getUsers()
      .then(data => setUsers(Array.isArray(data) ? data : (data.users || [])))
      .catch(() => flash('Error cargando usuarios', 'error'))
      .finally(() => setLoadingUsers(false));
  };

  const fetchMetrics = () => {
    adminAPI.getMetrics()
      .then(data => {
        if (data.success) {
          setDbMetrics({
            users: data.users,
            exercises: data.exercises,
            routines: data.routines,
            restrictions: data.restrictions
          });
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (tab === 'churn') {
      Promise.resolve().then(() => setLoadingAI(true));
      aiAPI.getChurnPrediction()
        .then(data => setChurnData(data.predictions || []))
        .catch(() => flash('Error cargando predicciones de deserción', 'error'))
        .finally(() => setLoadingAI(false));
    }
    if (tab === 'anomalies') {
      Promise.resolve().then(() => setLoadingAI(true));
      aiAPI.getBiometricAnomalies()
        .then(data => setAnomaliesData(data.anomalies || []))
        .catch(() => flash('Error cargando anomalías biométricas', 'error'))
        .finally(() => setLoadingAI(false));
    }
    if ((tab === 'create-routine' || tab === 'my-routines') && associationRules.length === 0) {
      aiAPI.getAssociationRules()
        .then(data => setAssociationRules(data.rules || []))
        .catch(() => console.error('Error loading association rules'));
    }
  }, [tab, associationRules.length]);

  useEffect(() => {
    let socket;
    if (tab === 'db-dashboard') {
      socket = io();
      socket.on('connect', () => {
        socket.emit('join_seed_room', roomId);
      });
      socket.on('seed_progress', (data) => {
        setSeedProgress(data);
        if (data.percent === 100) {
          fetchUsers();
          fetchMetrics();
          if (loadContent) loadContent();
        }
      });
      socket.on('metrics_update', (data) => {
        setDbMetrics(p => ({ ...p, ...data }));
      });
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [tab, roomId]);

  const saveEx = async (e) => {
    e.preventDefault();
    if (!exForm.name || !exForm.description || !exForm.instructions) return;
    try {
      await saveAdminItem({ ...exForm, title: exForm.name, muscleIds: !isNaN(parseInt(exForm.muscleGroup)) ? JSON.stringify([parseInt(exForm.muscleGroup)]) : "[]", restrictions: "[]", tags: [], steps: [exForm.instructions], isSafe: true }, 'exercises');
      setExForm(emptyEx);
      flash('Ejercicio creado y guardado en la base de datos');
    } catch (err) { flash(err.message, 'error'); }
  };

  const saveRt = async (e) => {
    e.preventDefault();
    if (!rtForm.name || !rtForm.description) return;
    
    const difficultyMap = { beginner: 'PRINCIPIANTE', intermediate: 'INTERMEDIO', advanced: 'AVANZADO' };
    const bodyTypeMap = { full_body: 'MESOMORFO', split: 'ECTOMORFO', upper: 'ENDOMORFO', lower: 'MESOMORFO', hiit: 'ECTOMORFO' };
    
    try {
      await saveAdminItem({ 
        ...rtForm, 
        title: rtForm.name,
        difficulty: difficultyMap[rtForm.level] || 'PRINCIPIANTE',
        body_type: bodyTypeMap[rtForm.category] || 'MESOMORFO',
        exercises: JSON.stringify(rtForm.selectedExercises.map((se, idx) => ({
          exercise_id: se.exercise_id,
          reps: se.reps,
          sets: se.sets,
          day_number: se.day_number,
          order: idx + 1
        }))), 
        restrictions: [], 
        tags: [], 
        muscleGroups: [], 
        isSafe: true 
      }, 'routines');
      setRtForm(emptyRt);
      flash('Rutina creada y guardada en la base de datos');
    } catch (err) { flash(err.message, 'error'); }
  };

  const handleUpdateEx = async (id, form) => {
    try {
      await updateAdminItem(id, { ...form, title: form.name, muscleIds: !isNaN(parseInt(form.muscleGroup)) ? JSON.stringify([parseInt(form.muscleGroup)]) : "[]", restrictions: "[]", steps: [form.instructions] }, 'exercises');
      setEditingId(null);
      flash('Ejercicio actualizado correctamente');
    } catch (err) { flash(err.message, 'error'); }
  };

  const handleUpdateRt = async (id, form) => {
    const difficultyMap = { beginner: 'PRINCIPIANTE', intermediate: 'INTERMEDIO', advanced: 'AVANZADO' };
    const bodyTypeMap = { full_body: 'MESOMORFO', split: 'ECTOMORFO', upper: 'ENDOMORFO', lower: 'MESOMORFO', hiit: 'ECTOMORFO' };
    try {
      await updateAdminItem(id, { 
        ...form, 
        title: form.name,
        difficulty: difficultyMap[form.level] || 'PRINCIPIANTE',
        body_type: bodyTypeMap[form.category] || 'MESOMORFO',
        exercises: JSON.stringify(form.selectedExercises.map((se, idx) => ({
          exercise_id: se.exercise_id,
          reps: se.reps,
          sets: se.sets,
          day_number: se.day_number,
          order: idx + 1
        })))
      }, 'routines');
      setEditingId(null);
      flash('Rutina actualizada correctamente');
    } catch (err) { flash(err.message, 'error'); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('¿Seguro que deseas eliminar este elemento?')) return;
    try {
      await deleteAdminItem(id, type);
      flash(`Eliminado correctamente`);
    } catch (err) { flash(err.message, 'error'); }
  };

  const handleSeed = async () => {
    try {
      await adminAPI.seed({ count: 50, roomId });
      flash('Seed iniciado...', 'success');
    } catch (e) { flash(e.message, 'error'); }
  };

  const handleClean = async () => {
    if (!window.confirm('¿Estás seguro de eliminar TODO de la BD?')) return;
    try {
      await adminAPI.clean();
      flash('Base de datos limpiada', 'success');
      setDbMetrics({ users: 0, exercises: 0, routines: 0, restrictions: 0 });
    } catch (e) { flash(e.message, 'error'); }
  };

  const handleExportCsv = async () => {
    try {
      await adminAPI.exportCsv();
      flash('Descargando CSV...', 'success');
    } catch (e) { flash(e.message, 'error'); }
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await adminAPI.importCsv(file);
      flash('CSV importado', 'success');
    } catch (err) { flash(err.message, 'error'); }
    e.target.value = null;
  };
  // Catálogo completo
  const allExercises = exercises || [];
  const allRoutines = routines || [];

  // --- Nuevos Datasets ---
  const bodyTypes = { ECTOMORFO: 0, MESOMORFO: 0, ENDOMORFO: 0 };
  users.forEach(u => {
    if (u.body_type) bodyTypes[u.body_type] = (bodyTypes[u.body_type] || 0) + 1;
  });
  const radarData = Object.keys(bodyTypes).map(type => ({ category: type, value: bodyTypes[type] }));

  const usersByDate = {};
  users.forEach(u => {
    if (!u.created_at) return;
    const dateStr = new Date(u.created_at).toISOString().split('T')[0];
    usersByDate[dateStr] = (usersByDate[dateStr] || 0) + 1;
  });
  let cumulativeUsers = 0;
  const areaData = Object.keys(usersByDate).sort().map(dateStr => {
    cumulativeUsers += usersByDate[dateStr];
    return { date: new Date(dateStr).getTime(), value: cumulativeUsers };
  });

  const diffCounts = {};
  allExercises.forEach(ex => {
    const d = ex.difficulty || 'beginner';
    diffCounts[d] = (diffCounts[d] || 0) + 1;
  });
  const diffMap = { 'beginner': 'Principiante', 'intermediate': 'Intermedio', 'advanced': 'Avanzado', 'PRINCIPIANTE': 'Principiante', 'INTERMEDIO': 'Intermedio', 'AVANZADO': 'Avanzado' };
  const funnelData = Object.keys(diffCounts).map(d => ({ category: diffMap[d] || d, value: diffCounts[d] })).sort((a,b) => b.value - a.value);

  const rtCounts = {};
  allRoutines.forEach(rt => {
    const c = rt.category || 'full_body';
    rtCounts[c] = (rtCounts[c] || 0) + 1;
  });
  const rtCatLabels = { 'upper': 'Tren superior', 'lower': 'Tren inferior', 'core': 'Core', 'full_body': 'Cuerpo completo', 'cardio': 'Cardio', 'mobility': 'Movilidad' };
  const rtCatData = Object.keys(rtCounts).map(c => ({ name: rtCatLabels[c] || c, count: rtCounts[c] }));

  const dbChartData = [
    { name: 'Usuarios', count: dbMetrics.users, fill: '#60a5fa' },
    { name: 'Ejercicios', count: dbMetrics.exercises, fill: '#34d399' },
    { name: 'Rutinas', count: dbMetrics.routines, fill: '#a78bfa' },
    { name: 'Restricciones', count: dbMetrics.restrictions, fill: '#fbbf24' }
  ];

  const TABS = [
    { id:'create-exercise', icon:<Plus size={16} weight="bold" />, label:'Nuevo ejercicio' },
    { id:'create-routine', icon:<Notebook size={16} weight="bold" />, label:'Nueva rutina' },
    { id:'my-exercises', icon:<Barbell size={16} weight="bold" />, label:'Mis ejercicios' },
    { id:'my-routines', icon:<FolderOpen size={16} weight="bold" />, label:'Mis rutinas' },
    { id:'catalogue-ex', icon:<BookOpen size={16} weight="bold" />, label:'Catálogo ejercicios' },
    { id:'catalogue-rt', icon:<Eye size={16} weight="bold" />, label:'Catálogo rutinas' },
    { id:'users', icon:<Users size={16} weight="bold" />, label:'Usuarios' },
    { id:'db-dashboard', icon:<Database size={16} weight="bold" />, label:'Dashboard DB' },
    { id:'churn', icon:<HeartBreak size={16} weight="bold" />, label:'Deserción (IA)' },
    { id:'anomalies', icon:<Pulse size={16} weight="bold" />, label:'Anomalías (IA)' },
  ];


  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="admin-logo" style={{ margin: 0 }}><Barbell size={28} weight="bold" /> <span>maxercise</span></div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '1rem' }}>Panel de Administrador</h1>
        </div>

        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <Link to="/home" className="btn btn-ghost btn-sm" style={{color:'white', borderColor:'rgba(255,255,255,0.3)'}}>
            <House size={14} weight="bold" /> Inicio
          </Link>
          <Link to="/exercises" className="btn btn-ghost btn-sm" style={{color:'white', borderColor:'rgba(255,255,255,0.3)'}}>
            <Barbell size={14} weight="bold" /> Ejercicios
          </Link>
          <Link to="/routines" className="btn btn-ghost btn-sm" style={{color:'white', borderColor:'rgba(255,255,255,0.3)'}}>
            <ListBullets size={14} weight="bold" /> Rutinas
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Sesión: <strong>{currentUser?.name}</strong> <span style={{color:'rgba(255,255,255,0.7)', fontSize:'0.75rem'}}>({currentUser?.role})</span>
          </p>
          <button className="admin-logout-btn" onClick={handleLogout} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            <SignOut size={15} weight="bold" /> Salir
          </button>
        </div>
      </div>

      {/* ── Breadcrumbs ── */}
      <div className="admin-breadcrumbs">
        <div className="admin-breadcrumbs-inner">
          <Link to="/" className="admin-bc-link"><House size={14} weight="bold" /> Inicio</Link>
          <CaretRight size={12} className="admin-bc-sep" />
          <span className="admin-bc-current">Panel de Administrador</span>
        </div>
      </div>

      {msg && <div className={`admin-flash ${msgType === 'error' ? 'admin-flash-error' : ''}`}>{msg}</div>}

      <div className="admin-container">
        <aside className="admin-sidebar">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setEditingId(null); }}>
              {t.icon} {t.label}
            </button>
          ))}
        </aside>

        <main className="admin-main">
          <div className="admin-main-inner">

          {/* ── CREAR EJERCICIO ── */}
          {tab === 'create-exercise' && (
            <form onSubmit={saveEx} className="admin-form">
              <h2><Plus size={18} weight="bold" /> Crear ejercicio</h2>
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={exForm.name} onChange={e => setExForm(p => ({...p, name:e.target.value}))} required placeholder="Ej: Press de Banca" /></div>
              <div className="form-group"><label className="form-label">Descripción *</label><textarea className="form-input" rows={3} value={exForm.description} onChange={e => setExForm(p => ({...p, description:e.target.value}))} required placeholder="Describe el ejercicio..." /></div>
              <div className="form-group"><label className="form-label">Instrucciones *</label><textarea className="form-input" rows={3} value={exForm.instructions} onChange={e => setExForm(p => ({...p, instructions:e.target.value}))} required placeholder="Pasos para realizar el ejercicio..." /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Grupo muscular</label>
                  <select className="form-input" value={exForm.muscleGroup} onChange={e => setExForm(p => ({...p, muscleGroup:e.target.value}))}>
                    {MUSCLE_GROUPS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Área corporal</label>
                  <select className="form-input" value={exForm.bodyArea} onChange={e => setExForm(p => ({...p, bodyArea:e.target.value}))}>
                    {BODY_AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dificultad</label>
                  <select className="form-input" value={exForm.difficulty} onChange={e => setExForm(p => ({...p, difficulty:e.target.value}))}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Equipo necesario</label><input className="form-input" value={exForm.equipment} onChange={e => setExForm(p => ({...p, equipment:e.target.value}))} placeholder="Ej: mancuernas, banco" /></div>
              <div className="form-group"><label className="form-label">URL de imagen (opcional)</label><input className="form-input" value={exForm.image} onChange={e => setExForm(p => ({...p, image:e.target.value}))} placeholder="https://..." /></div>
              <button type="submit" className="btn btn-primary">Guardar ejercicio</button>
            </form>
          )}

          {/* ── CREAR RUTINA ── */}
          {tab === 'create-routine' && (
            <form onSubmit={saveRt} className="admin-form">
              <h2><Notebook size={18} weight="bold" /> Crear rutina</h2>
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={rtForm.name} onChange={e => setRtForm(p => ({...p, name:e.target.value}))} required placeholder="Ej: Mi rutina de pecho" /></div>
              <div className="form-group"><label className="form-label">Descripción *</label><textarea className="form-input" rows={3} value={rtForm.description} onChange={e => setRtForm(p => ({...p, description:e.target.value}))} required placeholder="Describe la rutina..." /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nivel</label>
                  <select className="form-input" value={rtForm.level} onChange={e => setRtForm(p => ({...p, level:e.target.value}))}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={rtForm.category} onChange={e => setRtForm(p => ({...p, category:e.target.value}))}>
                    {ROUTINE_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Duración</label><input className="form-input" value={rtForm.duration} onChange={e => setRtForm(p => ({...p, duration:e.target.value}))} placeholder="Ej: 45 min" /></div>
                <div className="form-group"><label className="form-label">Frecuencia</label><input className="form-input" value={rtForm.frequency} onChange={e => setRtForm(p => ({...p, frequency:e.target.value}))} placeholder="Ej: 3x/semana" /></div>
              </div>
              <div className="form-group"><label className="form-label">URL de imagen (opcional)</label><input className="form-input" value={rtForm.image} onChange={e => setRtForm(p => ({...p, image:e.target.value}))} placeholder="https://..." /></div>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontSize: '1rem', color: 'var(--gray-800)' }}>
                  Ejercicios en esta rutina ({rtForm.selectedExercises.length})
                </label>
                <select
                  className="form-input"
                  defaultValue=""
                  onChange={(e) => {
                    const exId = parseInt(e.target.value);
                    if (exId) {
                      const ex = allExercises.find(ex => ex.id === exId);
                      if (ex && !rtForm.selectedExercises.some(se => se.exercise_id === exId)) {
                        setRtForm(p => ({
                          ...p,
                          selectedExercises: [
                            ...p.selectedExercises,
                            { exercise_id: exId, name: ex.name, reps: 10, sets: 3, day_number: 1 }
                          ]
                        }));
                      }
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="" disabled>-- Selecciona un ejercicio para añadir --</option>
                  {allExercises.map(ex => (
                    <option key={ex.id} value={ex.id} disabled={rtForm.selectedExercises.some(se => se.exercise_id === ex.id)}>
                      {ex.name}
                    </option>
                  ))}
                </select>

                {/* 💡 Sugerencias de IA (Market Basket / Reglas de Asociación) */}
                {associationRules.length > 0 && (
                  <div className="ai-suggestions-panel" style={{
                    marginTop: '10px',
                    padding: '12px',
                    background: 'var(--blue-pale)',
                    border: '1px dashed var(--blue-primary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Brain size={16} weight="fill" /> Sugerencias de Asociación (IA)
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {associationRules
                        .filter(rule => {
                          if (rtForm.selectedExercises.length === 0) return true;
                          return rtForm.selectedExercises.some(se => se.exercise_id === rule.antecedent_id);
                        })
                        .slice(0, 3)
                        .map((rule, index) => {
                          const ant = allExercises.find(e => e.id === rule.antecedent_id);
                          const cons = allExercises.find(e => e.id === rule.consequent_id);
                          if (!ant || !cons) return null;
                          const isAlreadySelected = rtForm.selectedExercises.some(se => se.exercise_id === cons.id);

                          return (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'white',
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(26, 111, 212, 0.15)',
                              fontSize: '0.8rem'
                            }}>
                              <span style={{ color: 'var(--gray-700)' }}>
                                Frecuente con <strong>{ant?.name}</strong>: <strong>{cons?.name}</strong> (Confianza: {Math.round(rule.confidence * 100)}%)
                              </span>
                              {!isAlreadySelected && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-xs"
                                  style={{ padding: '2px 8px', fontSize: '0.75rem', height: '24px', display: 'flex', alignItems: 'center' }}
                                  onClick={() => {
                                    setRtForm(p => ({
                                      ...p,
                                      selectedExercises: [
                                        ...p.selectedExercises,
                                        { exercise_id: cons.id, name: cons.name, reps: 10, sets: 3, day_number: 1 }
                                      ]
                                    }));
                                  }}
                                >
                                  + Añadir
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {rtForm.selectedExercises.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginTop: '10px' }}>
                    {rtForm.selectedExercises.map((se, idx) => (
                      <div key={se.exercise_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: 'white', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-100)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1, minWidth: '150px' }}>{se.name}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Series:</span>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '55px', padding: '6px', fontSize: '0.85rem', textAlign: 'center' }}
                              value={se.sets}
                              min={1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setRtForm(p => {
                                  const updated = [...p.selectedExercises];
                                  updated[idx] = { ...updated[idx], sets: val };
                                  return { ...p, selectedExercises: updated };
                                });
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Reps:</span>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '55px', padding: '6px', fontSize: '0.85rem', textAlign: 'center' }}
                              value={se.reps}
                              min={1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setRtForm(p => {
                                  const updated = [...p.selectedExercises];
                                  updated[idx] = { ...updated[idx], reps: val };
                                  return { ...p, selectedExercises: updated };
                                });
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Día:</span>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '55px', padding: '6px', fontSize: '0.85rem', textAlign: 'center' }}
                              value={se.day_number}
                              min={1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setRtForm(p => {
                                  const updated = [...p.selectedExercises];
                                  updated[idx] = { ...updated[idx], day_number: val };
                                  return { ...p, selectedExercises: updated };
                                });
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)', padding: '4px' }}
                            onClick={() => {
                              setRtForm(p => ({
                                ...p,
                                selectedExercises: p.selectedExercises.filter(item => item.exercise_id !== se.exercise_id)
                              }));
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary">Guardar rutina</button>
            </form>
          )}

          {/* ── MIS EJERCICIOS (editar / eliminar) ── */}
          {tab === 'my-exercises' && (
            <div>
              <h2><Barbell size={18} weight="bold" /> Mis ejercicios creados</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allExercises.filter(e => String(e.createdBy) === String(currentUser?.id)).length} ejercicio(s) creados por ti — puedes editarlos o eliminarlos
              </p>
              {allExercises.filter(e => String(e.createdBy) === String(currentUser?.id)).length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon"><PencilSimpleLine size={36} weight="light" /></div>
                  <h3>Aún no has creado ejercicios</h3>
                  <p>Ve a "Nuevo ejercicio" para añadir contenido</p>
                </div>
              ) : (
                <div className="admin-list">
                  {allExercises.filter(e => String(e.createdBy) === String(currentUser?.id)).map(ex => (
                    <div key={ex.id} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name">{ex.name}</div>
                          <div className="admin-item-meta">
                            {ex.muscleGroup || ex.muscle_group} · {ex.difficulty}
                            {ex.equipment && ` · ${ex.equipment}`}
                          </div>
                        </div>
                        <div className="admin-item-btns">
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => setEditingId(editingId === ex.id ? null : ex.id)}>
                            <PencilLine size={13} weight="bold" />
                            {editingId === ex.id ? 'Cerrar' : 'Editar'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id, 'exercises')}>
                            <Trash size={13} weight="bold" /> Eliminar
                          </button>
                        </div>
                      </div>
                      {editingId === ex.id && (
                        <EditExerciseForm
                          item={ex}
                          onSave={(form) => handleUpdateEx(ex.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MIS RUTINAS (editar / eliminar) ── */}
          {tab === 'my-routines' && (
            <div>
              <h2><FolderOpen size={18} weight="bold" /> Mis rutinas creadas</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allRoutines.filter(r => String(r.createdBy) === String(currentUser?.id)).length} rutina(s) creadas por ti — puedes editarlas o eliminarlas
              </p>
              {allRoutines.filter(r => String(r.createdBy) === String(currentUser?.id)).length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon"><Notebook size={36} weight="light" /></div>
                  <h3>Aún no has creado rutinas</h3>
                  <p>Ve a "Nueva rutina" para añadir contenido</p>
                </div>
              ) : (
                <div className="admin-list">
                  {allRoutines.filter(r => String(r.createdBy) === String(currentUser?.id)).map(rt => (
                    <div key={rt.id} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name">{rt.name}</div>
                          <div className="admin-item-meta">
                            {rt.level} · {rt.duration || '—'} · {rt.frequency || '—'}
                          </div>
                        </div>
                        <div className="admin-item-btns">
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => setEditingId(editingId === rt.id ? null : rt.id)}>
                            <PencilLine size={13} weight="bold" />
                            {editingId === rt.id ? 'Cerrar' : 'Editar'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rt.id, 'routines')}>
                            <Trash size={13} weight="bold" /> Eliminar
                          </button>
                        </div>
                      </div>
                      {editingId === rt.id && (
                        <EditRoutineForm
                          item={rt}
                          associationRules={associationRules}
                          onSave={(form) => handleUpdateRt(rt.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CATÁLOGO EJERCICIOS (solo lectura del estático, edit del propio) ── */}
          {tab === 'catalogue-ex' && (
            <div>
              <h2><BookOpen size={18} weight="bold" /> Catálogo completo de ejercicios</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allExercises.length} ejercicios totales · los tuyos se pueden editar/eliminar
              </p>
              <div className="admin-list">
                {allExercises.map((ex, i) => {
                  const isOwn = ex.isAdminCreated || ex.is_admin_created;
                  return (
                    <div key={ex.id || i} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name" style={{display:'flex',alignItems:'center',gap:'6px'}}>
                            {isOwn && <span style={{fontSize:'0.7rem',background:'var(--accent-primary)',color:'white',borderRadius:4,padding:'1px 6px'}}>tuyo</span>}
                            {ex.name}
                          </div>
                          <div className="admin-item-meta">
                            {ex.muscleGroup || ex.muscle_group} · {ex.difficulty}
                            {ex.equipment && ` · ${ex.equipment}`}
                          </div>
                        </div>
                        {isOwn && (
                          <div className="admin-item-btns">
                            <button className="btn btn-secondary btn-sm"
                              onClick={() => setEditingId(editingId === ex.id ? null : ex.id)}>
                              <PencilLine size={13} weight="bold" />
                              {editingId === ex.id ? 'Cerrar' : 'Editar'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id, 'exercises')}>
                              <Trash size={13} weight="bold" /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                      {isOwn && editingId === ex.id && (
                        <EditExerciseForm
                          item={ex}
                          onSave={(form) => handleUpdateEx(ex.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CATÁLOGO RUTINAS ── */}
          {tab === 'catalogue-rt' && (
            <div>
              <h2><Eye size={18} weight="bold" /> Catálogo completo de rutinas</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allRoutines.length} rutinas totales · las tuyas se pueden editar/eliminar
              </p>
              <div className="admin-list">
                {allRoutines.map((rt, i) => {
                  const isOwn = rt.isAdminCreated || rt.is_admin_created;
                  return (
                    <div key={rt.id || i} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name" style={{display:'flex',alignItems:'center',gap:'6px'}}>
                            {isOwn && <span style={{fontSize:'0.7rem',background:'var(--accent-primary)',color:'white',borderRadius:4,padding:'1px 6px'}}>tuya</span>}
                            {rt.name}
                          </div>
                          <div className="admin-item-meta">
                            {rt.level} · {rt.duration || '—'} · {rt.frequency || '—'}
                          </div>
                        </div>
                        {isOwn && (
                          <div className="admin-item-btns">
                            <button className="btn btn-secondary btn-sm"
                              onClick={() => setEditingId(editingId === rt.id ? null : rt.id)}>
                              <PencilLine size={13} weight="bold" />
                              {editingId === rt.id ? 'Cerrar' : 'Editar'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rt.id, 'routines')}>
                              <Trash size={13} weight="bold" /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                      {isOwn && editingId === rt.id && (
                        <EditRoutineForm
                          item={rt}
                          associationRules={associationRules}
                          onSave={(form) => handleUpdateRt(rt.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── USUARIOS ── */}
          {tab === 'users' && (
            <div>
              <h2><Users size={18} weight="bold" /> Usuarios registrados</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>Total: {users.length} usuario(s)</p>
              {loadingUsers ? <div className="spinner" /> : (
                <div className="admin-list">
                  {users.map(u => (
                    <div key={u.id} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                            {u.role === 'SUPER' && <ShieldCheck size={16} style={{color:'var(--accent-primary)'}} weight="fill" />}
                            {u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()}
                          </div>
                          <div className="admin-item-meta">
                            {u.email} · <span style={{color: u.role==='SUPER'?'var(--accent-primary)':'var(--text-muted)'}}>{u.role === 'SUPER' ? 'admin' : u.role}</span> · {new Date(u.created_at).toLocaleDateString('es-MX')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DASHBOARD DB ── */}
          {tab === 'db-dashboard' && (
            <div>
              <h2><Database size={18} weight="bold" /> Dashboard de Base de Datos</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                Monitorea en tiempo real el estado de la base de datos y gestiona el poblado de datos (Seed).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn btn-primary" onClick={handleSeed} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                  <Database size={24} />
                  <span>Poblar Base de Datos</span>
                </button>
                <button className="btn btn-danger" onClick={handleClean} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                  <Broom size={24} />
                  <span>Limpiar Tablas</span>
                </button>
                <button className="btn btn-secondary" onClick={handleExportCsv} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                  <DownloadSimple size={24} />
                  <span>Exportar CSV</span>
                </button>
                <label className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', cursor: 'pointer', margin: 0 }}>
                  <UploadSimple size={24} />
                  <span>Importar CSV</span>
                  <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCsv} />
                </label>
              </div>

              {seedProgress && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', border: '1px solid var(--gray-200)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--blue-primary)', fontSize: '1.1rem' }}>{seedProgress.message}</span>
                  </div>
                  <AmChartsGauge value={seedProgress.percent} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--gray-800)' }}>Totales por Entidad</h3>
                  <AmChartsBar data={dbChartData} />
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--gray-800)' }}>Distribución de Datos</h3>
                  <AmChartsPie data={dbChartData} id="am5-pie-chart-1" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--gray-800)' }}>Tipos de Cuerpo (Radar)</h3>
                  <AmChartsRadar data={radarData} />
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--gray-800)' }}>Niveles de Ejercicios (Embudo)</h3>
                  <AmChartsFunnel data={funnelData} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--gray-800)' }}>Categorías de Rutinas</h3>
                  <AmChartsPie data={rtCatData} id="am5-pie-chart-2" />
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--gray-800)' }}>Crecimiento de Usuarios (Timeline)</h3>
                  <AmChartsArea data={areaData} />
                </div>
              </div>
            </div>
          )}

          {/* ── PREDICCIÓN DE DESERCIÓN (CHURN) ── */}
          {tab === 'churn' && (
            <div>
              <h2><HeartBreak size={18} weight="bold" /> Predicción de Deserción de Usuarios (IA)</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                Detecta de forma preventiva a los usuarios que corren riesgo de abandonar el entrenamiento.
              </p>
              {loadingAI ? <div className="spinner" /> : (
                <div className="admin-list">
                  {churnData.length === 0 ? (
                    <div className="empty-state"><h3>No hay registros suficientes</h3><p>Registra entrenamientos en la app para calcular predicciones.</p></div>
                  ) : (
                    churnData.map(c => {
                      const userObj = users.find(u => u.id === c.user_id);
                      const userName = userObj ? (userObj.name || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()) : `Usuario #${c.user_id}`;
                      const userEmail = userObj?.email || '';
                      
                      const barColor = c.risk_level === 'Alto' ? '#ef4444' : c.risk_level === 'Medio' ? '#f59e0b' : '#10b981';
                      const badgeBg = c.risk_level === 'Alto' ? 'rgba(239,68,68,0.1)' : c.risk_level === 'Medio' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';

                      return (
                        <div key={c.user_id} className="admin-item-card ai-card">
                          <div className="admin-item-row" style={{alignItems:'flex-start'}}>
                            <div className="admin-item-info" style={{flex: 1}}>
                              <div className="admin-item-name">{userName}</div>
                              <div className="admin-item-meta">{userEmail}</div>
                              <div style={{marginTop:'0.75rem', fontSize:'0.8rem', color:'var(--text-muted)'}}>
                                <strong>Diagnóstico:</strong> {c.primary_reason}
                              </div>
                            </div>
                            <div style={{textAlign:'right', minWidth:'150px'}}>
                              <span style={{
                                display:'inline-block',
                                padding:'3px 8px',
                                borderRadius:'6px',
                                fontSize:'0.75rem',
                                fontWeight: 700,
                                color: barColor,
                                background: badgeBg,
                                textTransform: 'uppercase',
                                marginBottom:'0.5rem'
                              }}>
                                Riesgo {c.risk_level}
                              </span>
                              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', justifyContent:'flex-end'}}>
                                <span style={{fontSize:'0.8rem', fontWeight:600}}>{Math.round(c.churn_probability * 100)}%</span>
                                <div style={{width:'80px', height:'6px', background:'var(--gray-200)', borderRadius:'3px', overflow:'hidden'}}>
                                  <div style={{width: `${c.churn_probability * 100}%`, height:'100%', background: barColor}} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ANOMALÍAS BIOMÉTRICAS ── */}
          {tab === 'anomalies' && (
            <div>
              <h2><Pulse size={18} weight="bold" /> Anomalías Biométricas y Fallas de Lectura (IA)</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                Monitorea en tiempo real lecturas fisiológicas atípicas o fallas de sensores wearables.
              </p>
              {loadingAI ? <div className="spinner" /> : (
                <div className="admin-list">
                  {anomaliesData.length === 0 ? (
                    <div className="empty-state"><h3>Sin anomalías registradas</h3><p>Todos los registros biométricos están dentro del rango estándar.</p></div>
                  ) : (
                    anomaliesData.map(a => {
                      const userObj = users.find(u => u.id === a.user_id);
                      const userName = userObj ? (userObj.name || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()) : `Usuario #${a.user_id}`;
                      
                      return (
                        <div key={a.id} className="admin-item-card ai-card error-card">
                          <div className="admin-item-row">
                            <div className="admin-item-info">
                              <div className="admin-item-name" style={{color:'#ef4444', fontWeight:700}}>{a.reason}</div>
                              <div className="admin-item-meta" style={{marginTop:'0.25rem'}}>
                                Registrado por: <strong>{userName}</strong> · ID Lectura: #{a.id}
                              </div>
                              <div style={{marginTop:'0.5rem', display:'flex', gap:'1rem', flexWrap:'wrap', fontSize:'0.8rem'}}>
                                <div className="biometric-stat" style={{color:'var(--gray-700)', background:'var(--gray-100)', padding:'2px 8px', borderRadius:'4px'}}>❤️ {a.heart_rate} BPM</div>
                                <div className="biometric-stat" style={{color:'var(--gray-700)', background:'var(--gray-100)', padding:'2px 8px', borderRadius:'4px'}}>🔥 {a.calories} Kcal</div>
                                <div className="biometric-stat" style={{color:'var(--gray-700)', background:'var(--gray-100)', padding:'2px 8px', borderRadius:'4px'}}>⏱️ {a.duration_minutes} min</div>
                              </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase'}}>Puntaje Anomalía</div>
                              <div style={{fontSize:'1.1rem', fontWeight:800, color:'#ef4444'}}>{Math.round(a.anomaly_score * 100) / 100}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          </div>
        </main>
      </div>
    </div>
  );
}
