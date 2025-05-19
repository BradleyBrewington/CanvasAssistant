// content-script.js - Enhanced Phase 1 with Critical Bug Fixes
// Addressing: submission status detection, scrolling issues, and positioning problems

console.log('🚀 Canvas AI Assistant - Phase 1.1: Bug Fix Edition Loading...');

// Enhanced global state with submission tracking
window.canvasAssistantState = {
    initialized: false,
    messageHandlerActive: false,
    lastActivity: new Date().toISOString(),
    courses: [],
    assignments: [],
    quizzes: [],
    calendarEvents: [],
    announcements: [],
    submissions: [], // NEW: Track submission status
    extractionProgress: {
        totalCourses: 0,
        processedCourses: 0,
        currentCourse: '',
        stage: 'starting'
    },
    initializationStage: 'starting',
    errors: [],
    interfaceSettings: {
        position: 'top-right',
        isMinimized: false,
        isDraggable: true
    }
};

// Set up message handling (unchanged from previous version)
function setupBulletproofMessageHandling() {
    console.log('🔧 Setting up enhanced message handling...');
    
    if (chrome.runtime.onMessage.hasListeners()) {
        try {
            chrome.runtime.onMessage.removeListener(handleMessage);
        } catch (e) {
            // Safely ignore errors from removing non-existent listeners
        }
    }
    
    chrome.runtime.onMessage.addListener(handleMessage);
    window.canvasAssistantState.messageHandlerActive = true;
    
    console.log('✅ Enhanced message handling active');
}

// Enhanced message handler with submission status awareness
function handleMessage(message, sender, sendResponse) {
    console.log('📨 Enhanced message received:', message.action);
    
    const response = {
        timestamp: new Date().toISOString(),
        success: false,
        data: null,
        error: null
    };
    
    try {
        switch (message.action) {
            case 'ping':
                response.success = true;
                response.data = {
                    status: 'active',
                    initialized: window.canvasAssistantState.initialized,
                    assignmentCount: window.canvasAssistantState.assignments.length,
                    submissionTrackingActive: true,
                    extractionProgress: window.canvasAssistantState.extractionProgress
                };
                break;
                
            case 'get-status':
                response.success = true;
                response.data = {
                    lastUpdated: new Date().toLocaleString(),
                    totalCourses: window.canvasAssistantState.courses.length,
                    totalAssignments: window.canvasAssistantState.assignments.length,
                    trackedSubmissions: window.canvasAssistantState.submissions.length,
                    extractionProgress: window.canvasAssistantState.extractionProgress,
                    stage: window.canvasAssistantState.initializationStage
                };
                break;
                
            case 'refresh-data':
                console.log('🔄 Full refresh with submission tracking requested');
                response.success = true;
                response.data = { message: 'Enhanced refresh initiated' };
                setTimeout(() => {
                    performEnhancedComprehensiveExtraction();
                }, 100);
                break;
                
            case 'get-assignments':
                response.success = true;
                response.data = organizeAssignmentsByActualStatus(window.canvasAssistantState.assignments);
                break;
                
            case 'toggle-interface':
                toggleInterface();
                response.success = true;
                response.data = { message: 'Interface toggled' };
                break;
                
            default:
                response.error = `Unknown action: ${message.action}`;
        }
    } catch (error) {
        console.error('💥 Enhanced message handler error:', error);
        response.error = error.message;
    }
    
    sendResponse(response);
    return true;
}

// Enhanced comprehensive extraction with submission tracking
async function performEnhancedComprehensiveExtraction() {
    console.log('🎯 Starting enhanced comprehensive Canvas data extraction...');
    window.canvasAssistantState.initializationStage = 'enhanced-extraction';
    
    try {
        // Step 1: Extract course information
        await extractBasicCourseInformation();
        
        // Step 2: Extract assignments AND their submission status
        await extractAssignmentsWithSubmissionStatus();
        
        // Step 3: Organize by actual status (submitted vs. truly overdue)
        categorizeAssignmentsByActualStatus();
        
        // Step 4: Create improved interface with proper positioning and scrolling
        createImprovedAssignmentInterface();
        
        window.canvasAssistantState.initialized = true;
        window.canvasAssistantState.initializationStage = 'complete';
        
        console.log('✅ Enhanced extraction complete with submission tracking!');
        
    } catch (error) {
        console.error('❌ Enhanced extraction failed:', error);
        window.canvasAssistantState.errors.push(`Enhanced extraction failed: ${error.message}`);
        window.canvasAssistantState.initializationStage = 'extraction-failed';
    }
}

// Enhanced course information extraction (same as before)
async function extractBasicCourseInformation() {
    console.log('📚 Extracting enhanced course information...');
    window.canvasAssistantState.extractionProgress.stage = 'extracting-courses';
    
    try {
        const apiCourses = await fetchCoursesFromAPI();
        const dashboardCourses = extractCoursesFromDashboard();
        const allCourses = combineAndEnhanceCourseData(apiCourses, dashboardCourses);
        
        window.canvasAssistantState.courses = allCourses;
        window.canvasAssistantState.extractionProgress.totalCourses = allCourses.length;
        
        console.log(`✅ Enhanced course extraction complete: ${allCourses.length} courses identified`);
        
    } catch (error) {
        console.error('❌ Course extraction error:', error);
        window.canvasAssistantState.errors.push(`Course extraction error: ${error.message}`);
    }
}

// ENHANCED: Extract assignments WITH submission status tracking
async function extractAssignmentsWithSubmissionStatus() {
    console.log('📝 Beginning enhanced assignment extraction with submission tracking...');
    window.canvasAssistantState.extractionProgress.stage = 'extracting-assignments-with-submissions';
    
    // Clear existing data
    window.canvasAssistantState.assignments = [];
    window.canvasAssistantState.submissions = [];
    window.canvasAssistantState.quizzes = [];
    
    // Process each course with submission status awareness
    for (let i = 0; i < window.canvasAssistantState.courses.length; i++) {
        const course = window.canvasAssistantState.courses[i];
        
        window.canvasAssistantState.extractionProgress.processedCourses = i;
        window.canvasAssistantState.extractionProgress.currentCourse = course.name;
        
        console.log(`📚 Processing with submission tracking: ${course.name} (${i + 1}/${window.canvasAssistantState.courses.length})`);
        
        try {
            // Extract assignments and their submission status simultaneously
            await extractCourseAssignmentsWithSubmissions(course);
            await extractCourseQuizzesWithSubmissions(course);
            
            // Small delay to be respectful to Canvas servers
            await delay(300);
            
        } catch (error) {
            console.warn(`⚠️ Error processing ${course.name}:`, error);
            window.canvasAssistantState.errors.push(`Error in ${course.name}: ${error.message}`);
        }
    }
    
    window.canvasAssistantState.extractionProgress.processedCourses = window.canvasAssistantState.courses.length;
    window.canvasAssistantState.extractionProgress.stage = 'extraction-complete';
    
    console.log(`✅ Enhanced extraction complete: ${window.canvasAssistantState.assignments.length} assignments with submission tracking`);
}

// ENHANCED: Extract assignments WITH submission status for a specific course
async function extractCourseAssignmentsWithSubmissions(course) {
    try {
        // First, get all assignments
        const assignmentsResponse = await fetch(`/api/v1/courses/${course.id}/assignments?per_page=100`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!assignmentsResponse.ok) {
            console.warn(`Failed to fetch assignments for ${course.name}: ${assignmentsResponse.status}`);
            return;
        }
        
        const assignments = await assignmentsResponse.json();
        
        // Then, get submission status for each assignment
        const submissionsResponse = await fetch(`/api/v1/courses/${course.id}/assignments?include[]=submission&per_page=100`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        let submissionData = {};
        if (submissionsResponse.ok) {
            const assignmentsWithSubmissions = await submissionsResponse.json();
            assignmentsWithSubmissions.forEach(assignment => {
                if (assignment.submission) {
                    submissionData[assignment.id] = assignment.submission;
                }
            });
        }
        
        // Process assignments with submission awareness
        const processedAssignments = assignments.map(assignment => {
            const submission = submissionData[assignment.id];
            const hasSubmission = submission && submission.submitted_at && submission.workflow_state !== 'unsubmitted';
            const isLate = submission && submission.late;
            const submissionStatus = determineSubmissionStatus(assignment, submission);
            
            return {
                id: `assignment-${assignment.id}`,
                name: assignment.name,
                description: assignment.description,
                dueDate: assignment.due_at,
                unlockDate: assignment.unlock_at,
                lockDate: assignment.lock_at,
                pointsPossible: assignment.points_possible,
                submissionTypes: assignment.submission_types,
                htmlUrl: assignment.html_url,
                courseId: course.id,
                courseName: course.name,
                courseCode: course.courseCode,
                type: 'assignment',
                extractedFrom: 'api',
                extractedAt: new Date().toISOString(),
                // ENHANCED: Submission tracking fields
                hasSubmission: hasSubmission,
                submissionStatus: submissionStatus,
                isLate: isLate,
                submittedAt: submission ? submission.submitted_at : null,
                workflowState: submission ? submission.workflow_state : 'not_submitted',
                score: submission ? submission.score : null,
                grade: submission ? submission.grade : null
            };
        });
        
        window.canvasAssistantState.assignments.push(...processedAssignments);
        console.log(`  ✅ Found ${assignments.length} assignments with submission tracking in ${course.name}`);
        
    } catch (error) {
        console.warn(`  ❌ Enhanced assignment extraction error for ${course.name}:`, error);
    }
}

// NEW: Determine accurate submission status
function determineSubmissionStatus(assignment, submission) {
    if (!assignment.due_at) {
        return 'no_due_date';
    }
    
    const dueDate = new Date(assignment.due_at);
    const now = new Date();
    const isPastDue = dueDate < now;
    
    if (!submission || submission.workflow_state === 'unsubmitted') {
        if (isPastDue) {
            return 'overdue'; // Actually overdue - no submission and past due
        } else {
            return 'pending'; // Not yet due
        }
    }
    
    // Has a submission
    if (submission.submitted_at) {
        const submittedDate = new Date(submission.submitted_at);
        if (submittedDate <= dueDate) {
            return 'submitted_on_time';
        } else {
            return 'submitted_late';
        }
    }
    
    return 'unknown';
}

// ENHANCED: Extract quizzes with submission status
async function extractCourseQuizzesWithSubmissions(course) {
    try {
        // Get quizzes with submission data
        const quizzesResponse = await fetch(`/api/v1/courses/${course.id}/quizzes?per_page=100`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!quizzesResponse.ok) {
            console.warn(`Failed to fetch quizzes for ${course.name}: ${quizzesResponse.status}`);
            return;
        }
        
        const quizzes = await quizzesResponse.json();
        
        // For each quiz, check submission status
        for (const quiz of quizzes) {
            try {
                const submissionResponse = await fetch(`/api/v1/courses/${course.id}/quizzes/${quiz.id}/submissions/self`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                let submission = null;
                if (submissionResponse.ok) {
                    submission = await submissionResponse.json();
                }
                
                const hasSubmission = submission && submission.finished_at;
                const submissionStatus = determineQuizSubmissionStatus(quiz, submission);
                
                const processedQuiz = {
                    id: `quiz-${quiz.id}`,
                    name: quiz.title,
                    description: quiz.description,
                    dueDate: quiz.due_at,
                    unlockDate: quiz.unlock_at,
                    lockDate: quiz.lock_at,
                    pointsPossible: quiz.points_possible,
                    timeLimit: quiz.time_limit,
                    htmlUrl: quiz.html_url,
                    courseId: course.id,
                    courseName: course.name,
                    courseCode: course.courseCode,
                    type: 'quiz',
                    extractedFrom: 'api',
                    extractedAt: new Date().toISOString(),
                    // ENHANCED: Quiz submission tracking
                    hasSubmission: hasSubmission,
                    submissionStatus: submissionStatus,
                    finishedAt: submission ? submission.finished_at : null,
                    score: submission ? submission.score : null
                };
                
                window.canvasAssistantState.quizzes.push(processedQuiz);
                
            } catch (submissionError) {
                console.warn(`Could not fetch submission for quiz ${quiz.title}:`, submissionError);
                
                // Add quiz without submission info
                const processedQuiz = {
                    id: `quiz-${quiz.id}`,
                    name: quiz.title,
                    description: quiz.description,
                    dueDate: quiz.due_at,
                    unlockDate: quiz.unlock_at,
                    lockDate: quiz.lock_at,
                    pointsPossible: quiz.points_possible,
                    timeLimit: quiz.time_limit,
                    htmlUrl: quiz.html_url,
                    courseId: course.id,
                    courseName: course.name,
                    courseCode: course.courseCode,
                    type: 'quiz',
                    extractedFrom: 'api',
                    extractedAt: new Date().toISOString(),
                    hasSubmission: false,
                    submissionStatus: 'unknown'
                };
                
                window.canvasAssistantState.quizzes.push(processedQuiz);
            }
        }
        
        console.log(`  ✅ Found ${quizzes.length} quizzes with submission tracking in ${course.name}`);
        
    } catch (error) {
        console.warn(`  ❌ Enhanced quiz extraction error for ${course.name}:`, error);
    }
}

// NEW: Determine quiz submission status
function determineQuizSubmissionStatus(quiz, submission) {
    if (!quiz.due_at) {
        return 'no_due_date';
    }
    
    const dueDate = new Date(quiz.due_at);
    const now = new Date();
    const isPastDue = dueDate < now;
    
    if (!submission || !submission.finished_at) {
        if (isPastDue) {
            return 'overdue'; // Actually overdue - no submission and past due
        } else {
            return 'pending'; // Not yet due
        }
    }
    
    // Has a submission
    const finishedDate = new Date(submission.finished_at);
    if (finishedDate <= dueDate) {
        return 'submitted_on_time';
    } else {
        return 'submitted_late';
    }
}

// ENHANCED: Categorize assignments by ACTUAL status (not just due date)
function categorizeAssignmentsByActualStatus() {
    console.log('📊 Categorizing assignments by actual submission status...');
    window.canvasAssistantState.extractionProgress.stage = 'analyzing-with-submissions';
    
    // Combine all items for unified analysis
    const allItems = [
        ...window.canvasAssistantState.assignments,
        ...window.canvasAssistantState.quizzes
    ];
    
    // Organize by ACTUAL status, not just due date
    const organized = organizeAssignmentsByActualStatus(allItems);
    
    // Store enhanced analysis results
    window.canvasAssistantState.assignmentAnalysis = {
        organized: organized,
        stats: {
            totalItems: allItems.length,
            itemsWithDueDates: allItems.filter(item => item.dueDate).length,
            actuallyOverdueCount: organized.actuallyOverdue.length,
            submittedLateCount: organized.submittedLate.length,
            dueTodayCount: organized.dueToday.length,
            dueThisWeekCount: organized.dueThisWeek.length,
            submittedCount: allItems.filter(item => item.hasSubmission).length,
            pendingCount: organized.dueToday.length + organized.dueThisWeek.length + organized.dueLater.length
        },
        analyzedAt: new Date().toISOString()
    };
    
    console.log('✅ Enhanced analysis complete:', window.canvasAssistantState.assignmentAnalysis.stats);
}

// ENHANCED: Organize assignments by ACTUAL submission status
function organizeAssignmentsByActualStatus(items) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const categories = {
        actuallyOverdue: [],     // Past due AND no submission
        submittedLate: [],       // Past due BUT has submission (late)
        submittedOnTime: [],     // Has submission, submitted on time
        dueToday: [],           // Due today, no submission yet
        dueTomorrow: [],        // Due tomorrow, no submission yet
        dueThisWeek: [],        // Due this week, no submission yet
        dueNextWeek: [],        // Due next week
        dueLater: [],           // Due later
        noDueDate: []           // No due date specified
    };
    
    items.forEach(item => {
        // Handle items without due dates
        if (!item.dueDate) {
            categories.noDueDate.push(item);
            return;
        }
        
        const dueDate = new Date(item.dueDate);
        
        // Check submission status first
        switch (item.submissionStatus) {
            case 'submitted_on_time':
                categories.submittedOnTime.push(item);
                return;
                
            case 'submitted_late':
                categories.submittedLate.push(item);
                return;
                
            case 'overdue':
                categories.actuallyOverdue.push(item);
                return;
        }
        
        // For items without submission status or pending status, categorize by due date
        if (dueDate < today) {
            // Past due but no submission info - assume actually overdue
            categories.actuallyOverdue.push(item);
        } else if (dueDate < tomorrow) {
            categories.dueToday.push(item);
        } else if (dueDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
            categories.dueTomorrow.push(item);
        } else if (dueDate < thisWeek) {
            categories.dueThisWeek.push(item);
        } else if (dueDate < nextWeek) {
            categories.dueNextWeek.push(item);
        } else {
            categories.dueLater.push(item);
        }
    });
    
    // Sort each category appropriately
    Object.keys(categories).forEach(key => {
        if (key !== 'noDueDate') {
            categories[key].sort((a, b) => {
                const dateA = new Date(a.dueDate);
                const dateB = new Date(b.dueDate);
                
                // First sort by date, then by points
                if (dateA !== dateB) {
                    return dateA - dateB;
                }
                return (b.pointsPossible || 0) - (a.pointsPossible || 0);
            });
        }
    });
    
    return categories;
}

// ENHANCED: Create improved interface with better positioning and scrolling
function createImprovedAssignmentInterface() {
    console.log('🎨 Creating improved assignment interface with enhanced UX...');
    
    try {
        // Remove existing interface
        const existing = document.getElementById('canvas-ai-assistant');
        if (existing) existing.remove();
        
        // Create improved interface with better positioning
        const container = document.createElement('div');
        container.id = 'canvas-ai-assistant';
        container.className = 'ai-assistant-enhanced-v2';
        
        // Make it draggable and properly positioned
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: #ffffff;
            border: 2px solid #2D3B45;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;
        
        container.innerHTML = buildImprovedInterfaceHTML();
        
        // Inject into page
        document.body.appendChild(container);
        
        // Set up enhanced event listeners
        setupImprovedEventListeners();
        
        // Make interface draggable
        makeInterfaceDraggable(container);
        
        console.log('✅ Improved interface created successfully');
        
    } catch (error) {
        console.error('❌ Improved interface creation failed:', error);
        window.canvasAssistantState.errors.push(`Improved interface error: ${error.message}`);
    }
}

// NEW: Build improved interface HTML with proper scrolling
function buildImprovedInterfaceHTML() {
    const analysis = window.canvasAssistantState.assignmentAnalysis;
    const stats = analysis ? analysis.stats : {};
    const organized = analysis ? analysis.organized : {};
    
    return `
        <!-- Draggable Header -->
        <div class="ai-header-draggable" style="
            background: linear-gradient(135deg, #2D3B45, #3a4d5c);
            color: white;
            padding: 16px;
            border-radius: 10px 10px 0 0;
            cursor: move;
            user-select: none;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
                        🤖 Canvas AI Assistant
                    </h3>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">
                        Phase 1.1: Smart Assignment Tracker
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="ai-minimize-btn" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    " title="Minimize">−</button>
                    <button id="ai-close-btn" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    " title="Hide">×</button>
                </div>
            </div>
            
            <!-- Enhanced Stats Bar -->
            <div style="
                margin-top: 12px;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 8px;
                font-size: 11px;
            ">
                <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">
                    <div style="font-weight: 600; color: ${stats.actuallyOverdueCount > 0 ? '#ff6b6b' : '#4ecdc4'};">
                        ${stats.actuallyOverdueCount || 0}
                    </div>
                    <div>Actually Overdue</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">
                    <div style="font-weight: 600; color: ${stats.dueTodayCount > 0 ? '#ffa500' : '#4ecdc4'};">
                        ${stats.dueTodayCount || 0}
                    </div>
                    <div>Due Today</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">
                    <div style="font-weight: 600; color: '#4ecdc4';">
                        ${stats.submittedCount || 0}
                    </div>
                    <div>Submitted</div>
                </div>
            </div>
        </div>
        
        <!-- Scrollable Content Container -->
        <div class="ai-content-scrollable" style="
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 0;
            max-height: calc(80vh - 140px);
        ">
            <!-- Tab Navigation -->
            <div style="
                display: flex;
                border-bottom: 2px solid #f0f0f0;
                background: white;
                position: sticky;
                top: 0;
                z-index: 1;
            ">
                <button class="assignment-tab-button-v2 active" data-tab="urgent" style="
                    flex: 1;
                    background: none;
                    border: none;
                    padding: 12px 8px;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    font-weight: 500;
                    color: #666;
                    font-size: 13px;
                ">🚨 Urgent</button>
                <button class="assignment-tab-button-v2" data-tab="submitted" style="
                    flex: 1;
                    background: none;
                    border: none;
                    padding: 12px 8px;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    font-weight: 500;
                    color: #666;
                    font-size: 13px;
                ">✅ Done</button>
                <button class="assignment-tab-button-v2" data-tab="upcoming" style="
                    flex: 1;
                    background: none;
                    border: none;
                    padding: 12px 8px;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    font-weight: 500;
                    color: #666;
                    font-size: 13px;
                ">📅 Later</button>
            </div>
            
            <!-- Tab Content with Proper Scrolling -->
            <div style="padding: 16px;">
                <div id="urgent-tab-v2" class="assignment-tab-content-v2" style="display: block;">
                    ${generateImprovedUrgentTabHTML(organized)}
                </div>
                
                <div id="submitted-tab-v2" class="assignment-tab-content-v2" style="display: none;">
                    ${generateSubmittedTabHTML(organized)}
                </div>
                
                <div id="upcoming-tab-v2" class="assignment-tab-content-v2" style="display: none;">
                    ${generateImprovedUpcomingTabHTML(organized)}
                </div>
            </div>
        </div>
        
        <!-- Fixed Footer with Actions -->
        <div style="
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
            padding: 12px 16px;
            border-radius: 0 0 10px 10px;
        ">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <button id="refresh-assignments-v2" style
                <button id="refresh-assignments-v2" style="
                   background: #3b82f6;
                   color: white;
                   border: none;
                   padding: 10px;
                   border-radius: 6px;
                   cursor: pointer;
                   font-weight: 500;
                   font-size: 13px;
                   transition: background-color 0.2s;
               " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">🔄 Refresh</button>
               
               <button id="export-assignments-v2" style="
                   background: #10b981;
                   color: white;
                   border: none;
                   padding: 10px;
                   border-radius: 6px;
                   cursor: pointer;
                   font-weight: 500;
                   font-size: 13px;
                   transition: background-color 0.2s;
               " onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">💾 Export</button>
           </div>
           
           <!-- Compact Stats -->
           <div style="font-size: 11px; color: #666; text-align: center;">
               Last updated: ${new Date().toLocaleTimeString()} • 
               ${stats.totalItems || 0} total items tracked
           </div>
       </div>
   `;
}

// NEW: Generate improved urgent tab that distinguishes between actually overdue and submitted late
function generateImprovedUrgentTabHTML(organized) {
   if (!organized) return '<div style="text-align: center; color: #666; padding: 20px;">Loading urgent items...</div>';
   
   const actuallyOverdue = organized.actuallyOverdue || [];
   const dueToday = organized.dueToday || [];
   const dueTomorrow = organized.dueTomorrow || [];
   const submittedLate = organized.submittedLate || [];
   
   const allUrgentItems = [...actuallyOverdue, ...dueToday, ...dueTomorrow];
   
   if (allUrgentItems.length === 0 && submittedLate.length === 0) {
       return `
           <div style="text-align: center; padding: 30px; color: #666;">
               <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
               <div style="font-weight: 600; color: #10b981; margin-bottom: 8px;">No urgent assignments!</div>
               <div style="font-size: 13px;">You're all caught up on immediate deadlines.</div>
           </div>
       `;
   }
   
   let html = '';
   
   // Actually Overdue Section
   if (actuallyOverdue.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #dc2626; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #fef2f2;
                   border-radius: 6px;
                   border-left: 4px solid #dc2626;
               ">
                   🚨 Actually Overdue (${actuallyOverdue.length})
               </h4>
               ${actuallyOverdue.map(item => generateImprovedAssignmentItemHTML(item, 'actually-overdue')).join('')}
           </div>
       `;
   }
   
   // Due Today Section
   if (dueToday.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #d97706; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #fffbeb;
                   border-radius: 6px;
                   border-left: 4px solid #d97706;
               ">
                   🔥 Due Today (${dueToday.length})
               </h4>
               ${dueToday.map(item => generateImprovedAssignmentItemHTML(item, 'due-today')).join('')}
           </div>
       `;
   }
   
   // Due Tomorrow Section
   if (dueTomorrow.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #d97706; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #fffbeb;
                   border-radius: 6px;
                   border-left: 4px solid #d97706;
               ">
                   ⏰ Due Tomorrow (${dueTomorrow.length})
               </h4>
               ${dueTomorrow.map(item => generateImprovedAssignmentItemHTML(item, 'due-tomorrow')).join('')}
           </div>
       `;
   }
   
   // Submitted Late Section (for awareness)
   if (submittedLate.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #7c2d12; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #fff7ed;
                   border-radius: 6px;
                   border-left: 4px solid #ea580c;
               ">
                   ⚠️ Submitted Late (${submittedLate.length})
               </h4>
               ${submittedLate.map(item => generateImprovedAssignmentItemHTML(item, 'submitted-late')).join('')}
           </div>
       `;
   }
   
   return html;
}

// NEW: Generate submitted assignments tab
function generateSubmittedTabHTML(organized) {
   if (!organized) return '<div style="text-align: center; color: #666; padding: 20px;">Loading submitted items...</div>';
   
   const submittedOnTime = organized.submittedOnTime || [];
   const submittedLate = organized.submittedLate || [];
   
   if (submittedOnTime.length === 0 && submittedLate.length === 0) {
       return `
           <div style="text-align: center; padding: 30px; color: #666;">
               <div style="font-size: 36px; margin-bottom: 10px;">📝</div>
               <div>No submitted assignments found</div>
               <div style="font-size: 13px; margin-top: 8px; color: #999;">Completed work will appear here.</div>
           </div>
       `;
   }
   
   let html = '';
   
   // Submitted On Time
   if (submittedOnTime.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #059669; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #f0fdf4;
                   border-radius: 6px;
                   border-left: 4px solid #059669;
               ">
                   ✅ Submitted On Time (${submittedOnTime.length})
               </h4>
               ${submittedOnTime.map(item => generateImprovedAssignmentItemHTML(item, 'submitted-on-time')).join('')}
           </div>
       `;
   }
   
   // Submitted Late  
   if (submittedLate.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #ea580c; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #fff7ed;
                   border-radius: 6px;
                   border-left: 4px solid #ea580c;
               ">
                   ⏰ Submitted Late (${submittedLate.length})
               </h4>
               ${submittedLate.map(item => generateImprovedAssignmentItemHTML(item, 'submitted-late')).join('')}
           </div>
       `;
   }
   
   return html;
}

// NEW: Generate improved upcoming tab
function generateImprovedUpcomingTabHTML(organized) {
   if (!organized) return '<div style="text-align: center; color: #666; padding: 20px;">Loading upcoming items...</div>';
   
   const dueThisWeek = organized.dueThisWeek || [];
   const dueNextWeek = organized.dueNextWeek || [];
   const dueLater = organized.dueLater || [];
   
   if (dueThisWeek.length === 0 && dueNextWeek.length === 0 && dueLater.length === 0) {
       return `
           <div style="text-align: center; padding: 30px; color: #666;">
               <div style="font-size: 36px; margin-bottom: 10px;">📅</div>
               <div>No upcoming assignments</div>
               <div style="font-size: 13px; margin-top: 8px; color: #999;">All caught up for now!</div>
           </div>
       `;
   }
   
   let html = '';
   
   // This Week
   if (dueThisWeek.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #2563eb; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #eff6ff;
                   border-radius: 6px;
                   border-left: 4px solid #2563eb;
               ">
                   📅 This Week (${dueThisWeek.length})
               </h4>
               ${dueThisWeek.map(item => generateImprovedAssignmentItemHTML(item, 'due-this-week')).join('')}
           </div>
       `;
   }
   
   // Next Week
   if (dueNextWeek.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #7c3aed; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #f5f3ff;
                   border-radius: 6px;
                   border-left: 4px solid #7c3aed;
               ">
                   📆 Next Week (${dueNextWeek.length})
               </h4>
               ${dueNextWeek.map(item => generateImprovedAssignmentItemHTML(item, 'due-next-week')).join('')}
           </div>
       `;
   }
   
   // Later
   if (dueLater.length > 0) {
       html += `
           <div style="margin-bottom: 20px;">
               <h4 style="
                   margin: 0 0 12px 0; 
                   color: #6b7280; 
                   font-size: 14px; 
                   font-weight: 600;
                   padding: 8px 12px;
                   background: #f9fafb;
                   border-radius: 6px;
                   border-left: 4px solid #6b7280;
               ">
                   🔜 Later (${dueLater.length})
               </h4>
               ${dueLater.map(item => generateImprovedAssignmentItemHTML(item, 'due-later')).join('')}
           </div>
       `;
   }
   
   return html;
}

// ENHANCED: Generate improved assignment item HTML with submission status awareness
function generateImprovedAssignmentItemHTML(item, category) {
   const dueDate = item.dueDate || item.startDate;
   const hasSubmission = item.hasSubmission;
   const submissionStatus = item.submissionStatus;
   
   // Determine styling based on actual status
   let borderColor = '#e2e8f0';
   let bgColor = '#ffffff';
   let statusText = '';
   let statusColor = '#666';
   let statusIcon = '';
   
   switch (submissionStatus) {
       case 'submitted_on_time':
           borderColor = '#059669';
           bgColor = '#f0fdf4';
           statusText = 'Submitted On Time';
           statusColor = '#059669';
           statusIcon = '✅';
           break;
       case 'submitted_late':
           borderColor = '#ea580c';
           bgColor = '#fff7ed';
           statusText = 'Submitted Late';
           statusColor = '#ea580c';
           statusIcon = '⏰';
           break;
       case 'overdue':
           borderColor = '#dc2626';
           bgColor = '#fef2f2';
           statusText = 'OVERDUE - Not Submitted';
           statusColor = '#dc2626';
           statusIcon = '🚨';
           break;
       default:
           if (category === 'due-today') {
               borderColor = '#d97706';
               bgColor = '#fffbeb';
               statusText = 'DUE TODAY';
               statusColor = '#d97706';
               statusIcon = '🔥';
           } else if (category === 'due-tomorrow') {
               borderColor = '#d97706';
               bgColor = '#fffbeb';
               statusText = 'DUE TOMORROW';
               statusColor = '#d97706';
               statusIcon = '⏰';
           } else if (dueDate) {
               const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
               statusText = `Due in ${daysUntilDue} day(s)`;
               statusColor = '#666';
               statusIcon = '📅';
           }
   }
   
   // Get assignment type icon
   const typeIcon = getAssignmentTypeIcon(item.type);
   
   return `
       <div style="
           background: ${bgColor};
           border: 1px solid ${borderColor};
           border-left: 4px solid ${borderColor};
           border-radius: 8px;
           padding: 12px;
           margin-bottom: 10px;
           transition: all 0.2s ease;
       " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
           
           <!-- Assignment Header -->
           <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
               <div style="flex: 1;">
                   <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                       <span style="font-size: 14px;">${typeIcon}</span>
                       <span style="font-weight: 600; color: #1f2937; font-size: 14px; line-height: 1.3;">
                           ${item.name}
                       </span>
                       ${hasSubmission ? `<span style="font-size: 12px;">${statusIcon}</span>` : ''}
                   </div>
                   <div style="font-size: 12px; color: #6b7280;">
                       ${item.courseCode || item.courseName}
                       ${item.pointsPossible ? ` • ${item.pointsPossible} points` : ''}
                       ${item.score !== null && item.score !== undefined ? ` • Score: ${item.score}/${item.pointsPossible || 'N/A'}` : ''}
                   </div>
               </div>
               
               ${item.htmlUrl ? `
                   <a href="${item.htmlUrl}" target="_blank" style="
                       color: #3b82f6;
                       text-decoration: none;
                       font-size: 18px;
                       padding: 4px;
                       border-radius: 4px;
                       transition: background-color 0.2s;
                   " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'" title="Open assignment">
                       🔗
                   </a>
               ` : ''}
           </div>
           
           <!-- Status and Due Date Info -->
           <div style="
               background: rgba(255,255,255,0.7);
               border-radius: 6px;
               padding: 8px;
               font-size: 12px;
           ">
               <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                   ${dueDate ? `
                       <span style="color: #374151;">
                           📅 Due: ${new Date(dueDate).toLocaleDateString()} at ${new Date(dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                   ` : `
                       <span style="color: #6b7280;">📅 No due date specified</span>
                   `}
                   <span style="
                       color: ${statusColor};
                       font-weight: 600;
                       font-size: 11px;
                       text-transform: uppercase;
                       letter-spacing: 0.5px;
                   ">
                       ${statusText}
                   </span>
               </div>
               
               ${item.submittedAt ? `
                   <div style="color: #6b7280; font-size: 11px;">
                       Submitted: ${new Date(item.submittedAt).toLocaleDateString()} at ${new Date(item.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </div>
               ` : ''}
           </div>
           
           <!-- Assignment Description Preview -->
           ${item.description && item.description.trim() ? `
               <div style="
                   margin-top: 8px;
                   padding-top: 8px;
                   border-top: 1px solid #f3f4f6;
                   font-size: 12px;
                   color: #4b5563;
                   line-height: 1.4;
               ">
                   ${truncateText(stripHtmlTags(item.description), 120)}
               </div>
           ` : ''}
       </div>
   `;
}

// NEW: Make interface draggable
function makeInterfaceDraggable(container) {
   const header = container.querySelector('.ai-header-draggable');
   let isDragging = false;
   let currentX;
   let currentY;
   let initialX;
   let initialY;
   let xOffset = 0;
   let yOffset = 0;
   
   header.addEventListener('mousedown', dragStart);
   document.addEventListener('mousemove', drag);
   document.addEventListener('mouseup', dragEnd);
   
   function dragStart(e) {
       initialX = e.clientX - xOffset;
       initialY = e.clientY - yOffset;
       
       if (e.target === header || header.contains(e.target)) {
           isDragging = true;
           container.style.cursor = 'grabbing';
       }
   }
   
   function drag(e) {
       if (isDragging) {
           e.preventDefault();
           currentX = e.clientX - initialX;
           currentY = e.clientY - initialY;
           
           xOffset = currentX;
           yOffset = currentY;
           
           container.style.transform = `translate(${currentX}px, ${currentY}px)`;
       }
   }
   
   function dragEnd(e) {
       initialX = currentX;
       initialY = currentY;
       
       isDragging = false;
       container.style.cursor = 'default';
   }
}

// NEW: Set up improved event listeners
function setupImprovedEventListeners() {
   // Minimize button
   const minimizeBtn = document.getElementById('ai-minimize-btn');
   const contentArea = document.querySelector('.ai-content-scrollable');
   
   if (minimizeBtn && contentArea) {
       minimizeBtn.addEventListener('click', () => {
           const isMinimized = contentArea.style.display === 'none';
           contentArea.style.display = isMinimized ? 'flex' : 'none';
           minimizeBtn.textContent = isMinimized ? '−' : '+';
           minimizeBtn.title = isMinimized ? 'Minimize' : 'Expand';
       });
   }
   
   // Close button
   const closeBtn = document.getElementById('ai-close-btn');
   if (closeBtn) {
       closeBtn.addEventListener('click', () => {
           const container = document.getElementById('canvas-ai-assistant');
           if (container) {
               container.style.display = 'none';
           }
       });
   }
   
   // Tab switching
   document.querySelectorAll('.assignment-tab-button-v2').forEach(button => {
       button.addEventListener('click', () => {
           // Update active tab button
           document.querySelectorAll('.assignment-tab-button-v2').forEach(btn => {
               btn.classList.remove('active');
               btn.style.color = '#666';
               btn.style.borderBottomColor = 'transparent';
           });
           
           button.classList.add('active');
           button.style.color = '#2563eb';
           button.style.borderBottomColor = '#2563eb';
           
           // Show corresponding tab content
           document.querySelectorAll('.assignment-tab-content-v2').forEach(content => {
               content.style.display = 'none';
           });
           
           const tabContent = document.getElementById(`${button.dataset.tab}-tab-v2`);
           if (tabContent) {
               tabContent.style.display = 'block';
           }
       });
   });
   
   // Refresh assignments
   const refreshButton = document.getElementById('refresh-assignments-v2');
   if (refreshButton) {
       refreshButton.addEventListener('click', () => {
           console.log('🔄 Enhanced refresh requested');
           refreshButton.innerHTML = '⏳ Refreshing...';
           refreshButton.disabled = true;
           
           performEnhancedComprehensiveExtraction().then(() => {
               refreshButton.innerHTML = '🔄 Refresh';
               refreshButton.disabled = false;
           });
       });
   }
   
   // Export assignments
   const exportButton = document.getElementById('export-assignments-v2');
   if (exportButton) {
       exportButton.addEventListener('click', () => {
           exportEnhancedAssignmentData();
       });
   }
}

// NEW: Export enhanced assignment data with submission status
function exportEnhancedAssignmentData() {
   console.log('💾 Exporting enhanced assignment data...');
   
   try {
       const exportData = {
           generatedAt: new Date().toISOString(),
           version: 'phase-1.1-enhanced-tracker',
           summary: {
               totalCourses: window.canvasAssistantState.courses.length,
               totalAssignments: window.canvasAssistantState.assignments.length,
               totalQuizzes: window.canvasAssistantState.quizzes.length,
               submissionTracking: true,
               ...(window.canvasAssistantState.assignmentAnalysis?.stats || {})
           },
           courses: window.canvasAssistantState.courses.map(course => ({
               id: course.id,
               name: course.name,
               courseCode: course.courseCode,
               assignments: window.canvasAssistantState.assignments.filter(a => a.courseId === course.id),
               quizzes: window.canvasAssistantState.quizzes.filter(q => q.courseId === course.id)
           })),
           organizationByStatus: window.canvasAssistantState.assignmentAnalysis?.organized || {},
           rawData: {
               assignments: window.canvasAssistantState.assignments,
               quizzes: window.canvasAssistantState.quizzes,
               submissions: window.canvasAssistantState.submissions
           }
       };
       
       const dataStr = JSON.stringify(exportData, null, 2);
       const dataBlob = new Blob([dataStr], { type: 'application/json' });
       const url = URL.createObjectURL(dataBlob);
       
       const link = document.createElement('a');
       link.href = url;
       link.download = `canvas-enhanced-assignment-export-${new Date().toISOString().split('T')[0]}.json`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
       
       console.log('✅ Enhanced assignment data exported successfully');
       
   } catch (error) {
       console.error('❌ Enhanced export failed:', error);
       alert('Export failed: ' + error.message);
   }
}

// NEW: Toggle interface visibility (for external control)
function toggleInterface() {
   const container = document.getElementById('canvas-ai-assistant');
   if (container) {
       const isHidden = container.style.display === 'none';
       container.style.display = isHidden ? 'block' : 'none';
       return !isHidden;
   }
   return false;
}

// Utility functions (unchanged from previous version)
function delay(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

function stripHtmlTags(html) {
   if (!html) return '';
   const div = document.createElement('div');
   div.innerHTML = html;
   return div.textContent || div.innerText || '';
}

function truncateText(text, maxLength) {
   if (!text) return '';
   if (text.length <= maxLength) return text;
   return text.substring(0, maxLength) + '...';
}

function getAssignmentTypeIcon(type) {
   const icons = {
       'assignment': '📝',
       'quiz': '📊',
       'discussion': '💬',
       'calendar_event': '📅',
       'announcement': '📢',
       'exam': '📋'
   };
   return icons[type] || '📄';
}

function fetchCoursesFromAPI() {
   console.log('🌐 Fetching courses from Canvas API...');
   
   return fetch('/api/v1/courses?enrollment_state=active&per_page=100', {
       headers: {
           'Accept': 'application/json',
           'X-Requested-With': 'XMLHttpRequest'
       }
   })
   .then(response => {
       if (response.ok) {
           return response.json();
       } else {
           console.warn('⚠️ API request failed, status:', response.status);
           return [];
       }
   })
   .then(courses => {
       console.log(`📡 API returned ${courses.length} courses`);
       return courses.map(course => ({
           id: course.id.toString(),
           name: course.name,
           courseCode: course.course_code,
           url: `https://canvas.tamu.edu/courses/${course.id}`,
           term: course.enrollment_term_id,
           startDate: course.start_at,
           endDate: course.end_at,
           extractedFrom: 'api',
           apiData: course
       }));
   })
   .catch(error => {
       console.warn('⚠️ API extraction failed:', error);
       return [];
   });
}

function extractCoursesFromDashboard() {
   console.log('🎴 Extracting courses from dashboard cards...');
   
   const courseCards = document.querySelectorAll('.ic-DashboardCard');
   
   return Array.from(courseCards).map((card, index) => {
       const titleElement = card.querySelector('.ic-DashboardCard__header-title');
       const subtitleElement = card.querySelector('.ic-DashboardCard__header-subtitle');
       const linkElement = card.querySelector('.ic-DashboardCard__link');
       
       const courseUrl = linkElement ? linkElement.href : '';
       const courseIdMatch = courseUrl.match(/courses\/(\d+)/);
       const courseId = courseIdMatch ? courseIdMatch[1] : null;
       
       return {
           id: courseId,
           name: titleElement ? titleElement.textContent.trim() : `Course ${index + 1}`,
           code: subtitleElement ? subtitleElement.textContent.trim() : '',
           url: courseUrl,
           extractedFrom: 'dashboard'
       };
   }).filter(course => course.id !== null);
}

function combineAndEnhanceCourseData(apiCourses, dashboardCourses) {
   console.log('🔗 Combining and enhancing course data...');
   
   const courseMap = new Map();
   
   apiCourses.forEach(course => {
       courseMap.set(course.id, course);
   });
   
   dashboardCourses.forEach(dashboardCourse => {
       if (!courseMap.has(dashboardCourse.id)) {
           courseMap.set(dashboardCourse.id, dashboardCourse);
       } else {
           const existingCourse = courseMap.get(dashboardCourse.id);
           courseMap.set(dashboardCourse.id, {
               ...existingCourse,
               dashboardData: dashboardCourse
           });
       }
   });
   
   return Array.from(courseMap.values());
}

// Initialize enhanced version
console.log('🔧 Setting up enhanced Canvas AI Assistant...');
setupBulletproofMessageHandling();

setTimeout(() => {
   console.log('🎬 Starting enhanced Canvas data extraction...');
   performEnhancedComprehensiveExtraction();
}, 1500);

// Navigation detection
let currentUrl = window.location.href;
const navigationObserver = new MutationObserver(() => {
   if (window.location.href !== currentUrl) {
       currentUrl = window.location.href;
       console.log('🧭 Canvas navigation detected, refreshing enhanced data...');
       setTimeout(() => {
           performEnhancedComprehensiveExtraction();
       }, 2000);
   }
});

navigationObserver.observe(document.body, { 
   childList: true, 
   subtree: true 
});

console.log('📜 Enhanced Canvas AI Assistant (Phase 1.1) fully loaded and ready!');