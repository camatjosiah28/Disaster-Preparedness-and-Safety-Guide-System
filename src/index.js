const supabaseUrl = https//ctorvyhbdmjnewrfrfyp.supabase.co;
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0b3J2eWhiZG1qbmV3cmZyZnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzcwMTcsImV4cCI6MjA4ODMxMzAxN30.R6py0gzli4JPxorA0LYEvQfsS0AQSy-p0T_rN3NEDaA;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function displayAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    const statusIndicator = document.getElementById('status-indicator');

    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'Active');

    if (error) {
        statusIndicator.innerText = "Error connecting to database";
        alertsContainer.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
        return;
    }

    statusIndicator.innerText = "Database Connected";

    if (data.length === 0) {
        alertsContainer.innerHTML = "<p>No active alerts at the moment.</p>";
    } else {
        alertsContainer.innerHTML = data.map(alert => `
            <div class="alert-card">
                <h3>${alert.title}</h3>
                <p>${alert.message}</p>
                <span class="badge">${alert.alert_type}</span>
            </div>
        `).join('');
    }
}

displayAlerts();