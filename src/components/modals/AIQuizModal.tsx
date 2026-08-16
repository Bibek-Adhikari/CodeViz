import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Lightbulb, 
  GraduationCap, 
  Award, 
  Check, 
  Code2,
  ChevronRight,
  BookOpen,
  BrainCircuit,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, ExecutionProgram, ExecutionStep, Language } from '../../types';
import { generateQuizForCode } from '../../utils/quizGenerator';

interface AIQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: Language;
  program: ExecutionProgram | null;
  currentStep: ExecutionStep | null;
  totalSteps: number;
}

export const AIQuizModal: React.FC<AIQuizModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
  program,
  currentStep,
  totalSteps,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate quiz questions on open or program change
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        const generated = generateQuizForCode(code, language, program, currentStep, totalSteps);
        setQuestions(generated);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowExplanation(false);
        setIsCompleted(false);
        setShowHint(false);
        setIsGenerating(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isOpen, code, language, program, currentStep, totalSteps]);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex];
  const selectedOptionIndex = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const isAnswered = selectedOptionIndex !== undefined;
  const isCorrect = isAnswered && selectedOptionIndex === currentQ.correctAnswerIndex;

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return; // locked after checking
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: idx,
    });
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === undefined) return;
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      setIsCompleted(true);
      // Trigger celebratory confetti if passed (>= 2/3)
      const correctCount = questions.filter(
        (q) => selectedAnswers[q.id] === q.correctAnswerIndex
      ).length;
      if (correctCount >= 2) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      }
    }
  };

  const handleRetakeQuiz = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateQuizForCode(code, language, program, currentStep, totalSteps);
      setQuestions(generated);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowExplanation(false);
      setIsCompleted(false);
      setShowHint(false);
      setIsGenerating(false);
    }, 300);
  };

  const correctAnswersCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswerIndex
  ).length;

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#121820] border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-2xl max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-14 px-5 bg-[#161E27] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
              <BrainCircuit className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                AI Logic & Flow Quiz
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  3 Questions
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {program?.title || 'Active Code Visualizer'} • Test your logic and memory understanding
              </p>
            </div>
          </div>

          <button
            id="quiz-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close Quiz"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 bg-[#0D1117]">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                AI is analyzing your code flow...
              </h4>
              <p className="text-xs text-slate-400">
                Formulating 3 concept questions on memory scope, execution order, and algorithm complexity.
              </p>
            </div>
          </div>
        ) : isCompleted ? (
          /* Final Results Screen */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0D1117]">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600/20 to-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Award className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-white">Quiz Completed!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You tested your mental model against the live execution steps. Here is your score breakdown:
              </p>

              {/* Score Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-xl bg-[#161E27] border border-slate-800 shadow-md">
                <span className="text-2xl font-extrabold text-blue-400">
                  {correctAnswersCount} / {questions.length}
                </span>
                <div className="text-left text-xs">
                  <span className="font-semibold text-white block">
                    {correctAnswersCount === 3
                      ? 'Mastery Level: 100%'
                      : correctAnswersCount === 2
                      ? 'Great Understanding (67%)'
                      : 'Needs Review (33%)'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {correctAnswersCount >= 2 ? 'Concepts successfully verified!' : 'Review the memory diagram and try again.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions Review List */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Question Review & Insights
              </h5>
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const wasCorrect = userAns === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      wasCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-rose-500/5 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {wasCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-white">
                          Q{idx + 1}: {q.topicCategory}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          wasCorrect
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {wasCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-2">{q.question}</p>
                    <div className="text-[11px] p-2.5 rounded-lg bg-[#0A0E14] border border-slate-800 text-slate-300 space-y-1">
                      <p>
                        <strong className="text-emerald-400">Correct Answer:</strong>{' '}
                        {q.options[q.correctAnswerIndex]}
                      </p>
                      <p className="text-slate-400 pt-1 border-t border-slate-800">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Question Flow */
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0D1117]">
            {/* Progress Stepper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Question <strong className="text-blue-400">{currentQuestionIndex + 1}</strong> of{' '}
                  <strong className="text-slate-200">{questions.length}</strong>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {currentQ?.topicCategory}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            {currentQ && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#161E27] border border-slate-800 space-y-2.5">
                  <h4 className="text-sm font-semibold text-slate-100 leading-relaxed">
                    {currentQ.question}
                  </h4>

                  {currentQ.codeSnippet && (
                    <div className="p-2.5 rounded-lg bg-[#0A0E14] border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                      <pre>{currentQ.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {currentQ.options.map((optionText, optIdx) => {
                    const isSelected = selectedOptionIndex === optIdx;
                    const isTheCorrectOne = optIdx === currentQ.correctAnswerIndex;

                    let optionStyle =
                      'bg-[#161E27] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-[#1A232E]';

                    if (showExplanation) {
                      if (isTheCorrectOne) {
                        optionStyle =
                          'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40';
                      } else if (isSelected && !isTheCorrectOne) {
                        optionStyle =
                          'bg-rose-500/15 border-rose-500 text-rose-200 shadow-md shadow-rose-500/10';
                      } else {
                        optionStyle = 'bg-[#121820] border-slate-800/60 text-slate-500 opacity-60';
                      }
                    } else if (isSelected) {
                      optionStyle =
                        'bg-blue-500/20 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50';
                    }

                    return (
                      <button
                        key={optIdx}
                        id={`quiz-option-${optIdx}`}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer text-xs ${optionStyle}`}
                      >
                        <span
                          className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {optionLetters[optIdx]}
                        </span>
                        <span className="flex-1 font-medium leading-relaxed">
                          {optionText}
                        </span>

                        {showExplanation && isTheCorrectOne && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {showExplanation && isSelected && !isTheCorrectOne && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Hint Accordion */}
                {currentQ.hint && (
                  <div>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
                    </button>
                    {showHint && (
                      <div className="mt-1.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                        {currentQ.hint}
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Card */}
                {showExplanation && (
                  <div
                    className={`p-3.5 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-150 space-y-1.5 ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-emerald-300 text-xs">
                            Correct Answer!
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span className="font-bold text-rose-300 text-xs">
                            Incorrect. Correct choice was ({optionLetters[currentQ.correctAnswerIndex]})
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="h-14 px-5 bg-[#161E27] border-t border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {isCompleted ? (
              <span>Review your concepts and visualization steps.</span>
            ) : (
              <span>Select the best answer and click check.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <button
                  id="quiz-retake-btn"
                  onClick={handleRetakeQuiz}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate New Quiz</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Back to CodeViz
                </button>
              </>
            ) : showExplanation ? (
              <button
                id="quiz-next-btn"
                onClick={handleNextQuestion}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
              >
                <span>
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="quiz-check-btn"
                onClick={handleCheckAnswer}
                disabled={selectedOptionIndex === undefined}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedOptionIndex !== undefined
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Check Answer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
