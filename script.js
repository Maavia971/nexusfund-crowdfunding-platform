    (function() {  
      // Helper for toast messages  
      const toast = document.getElementById('toastMsg');  
      function showMessage(text, isSuccess = true) {  
        toast.textContent = text || (isSuccess ? '✓ Success!' : '⚠️ Notice');  
        toast.classList.add('show');  
        setTimeout(() => {  
          toast.classList.remove('show');  
        }, 2800);  
      }  
  
      // ----- Fundraising simulation (dynamic project funding) -----  
      // Attach funding updates to all "Fund Project" buttons (graceful update)  
      const fundButtons = document.querySelectorAll('.fund-btn');  
      fundButtons.forEach(btn => {  
        btn.addEventListener('click', (e) => {  
          e.preventDefault();  
          const projectName = btn.getAttribute('data-project');  
          const goalAmount = parseFloat(btn.getAttribute('data-goal'));  
          let raisedAmount = parseFloat(btn.getAttribute('data-raised'));  
  
          // Simulate a pledge amount between $50 and $450  
          const pledge = Math.floor(Math.random() * 400) + 50;  
          const newRaised = raisedAmount + pledge;  
          const percentage = Math.min(100, Math.floor((newRaised / goalAmount) * 100));  
            
          // update data-raised attribute for future clicks  
          btn.setAttribute('data-raised', newRaised.toFixed(0));  
            
          // find parent card to update UI  
          const card = btn.closest('.project-card');  
          if (card) {  
            const progressDiv = card.querySelector('.progress');  
            const raisedTextElem = card.querySelector('.card-content p strong')?.parentElement;  
            if (progressDiv) {  
              progressDiv.style.width = `${percentage}%`;  
            }  
            if (raisedTextElem) {  
              raisedTextElem.innerHTML = `<strong>$${newRaised.toFixed(0)}</strong> raised of $${goalAmount.toFixed(0)}`;  
            }  
            // update funding progress label graceful  
            showMessage(`🎉 Thank you! You pledged $${pledge} to "${projectName}". Now at ${percentage}% funded!`, true);  
          } else {  
            showMessage(`✨ Pledged $${pledge} to ${projectName}!`, true);  
          }  
        });  
      });  
  
      // ----- CREATE PROJECT: dynamic addition to "Latest Updates" and project grid? (graceful mid-level extension)  
      const form = document.getElementById('projectForm');  
      const titleInput = document.getElementById('title');  
      const descInput = document.getElementById('description');  
      const goalInput = document.getElementById('goal');  
      const projectGrid = document.querySelector('.project-grid');  
      const updatesContainer = document.getElementById('updatesContainer');  
  
      form.addEventListener('submit', (e) => {  
        e.preventDefault();  
          
        const titleVal = titleInput.value.trim();  
        const descVal = descInput.value.trim();  
        const goalVal = parseFloat(goalInput.value);  
          
        if (!titleVal || !descVal || isNaN(goalVal) || goalVal < 500) {  
          showMessage('⚠️ Please fill all fields correctly (minimum goal $500).', false);  
          return;  
        }  
        
        
        // 1. Add new project card to featured projects grid (dynamic new project)
        const newCard = document.createElement('article');
        newCard.classList.add('project-card');
        // generate placeholder image with theme
        const imgPlaceholder = `https://placehold.co/600x400/e9f3ef/2d6a63?text=${encodeURIComponent(titleVal.slice(0,20))}`;
        newCard.innerHTML = `
          <img src="${imgPlaceholder}" alt="${titleVal}" loading="lazy" style="background:#e2e6df;">
          <div class="card-content">
            <h3>✨ ${escapeHtml(titleVal.slice(0, 35))}</h3>
            <p>${escapeHtml(descVal.slice(0, 100))}${descVal.length > 100 ? '…' : ''}</p>
            <div class="progress-bar">
              <div class="progress" style="width: 0%"></div>
            </div>
            <p><strong>$0</strong> raised of $${goalVal.toLocaleString()}</p>
            <button class="btn-secondary fund-btn" data-project="${escapeHtml(titleVal)}" data-goal="${goalVal}" data-raised="0">Fund Project <i class="fas fa-heart"></i></button>
          </div>
        `;
        // attach funding event to the new button
        const newFundBtn = newCard.querySelector('.fund-btn');
        if (newFundBtn) {
          newFundBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const pName = newFundBtn.getAttribute('data-project');
            const pGoal = parseFloat(newFundBtn.getAttribute('data-goal'));
            let pRaised = parseFloat(newFundBtn.getAttribute('data-raised'));
            const pledgeAmount = Math.floor(Math.random() * 300) + 40;
            const newTotal = pRaised + pledgeAmount;
            const newPercent = Math.min(100, Math.floor((newTotal / pGoal) * 100));
            newFundBtn.setAttribute('data-raised', newTotal.toFixed(0));
            const innerProgress = newCard.querySelector('.progress');
            const raisedTextP = newCard.querySelector('.card-content p strong')?.parentElement;
            if (innerProgress) innerProgress.style.width = `${newPercent}%`;
            if (raisedTextP) raisedTextP.innerHTML = `<strong>$${newTotal.toFixed(0)}</strong> raised of $${pGoal.toLocaleString()}`;
            showMessage(`💚 You backed "${pName}" with $${pledgeAmount}.`, true);
          });
        }
        
        // insert as first card to show latest creation (graceful)
        if (projectGrid) {
          projectGrid.insertBefore(newCard, projectGrid.firstChild);
        }
        
        // 2. Add update regarding new project creation (Latest Updates)
        const newUpdate = document.createElement('article');
        newUpdate.classList.add('update-card');
        const now = new Date();
        const timeStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        newUpdate.innerHTML = `
          <h3>🚀 New project launched: ${escapeHtml(titleVal.slice(0, 45))}</h3>
          <p>${escapeHtml(descVal.slice(0, 120))} — Goal: $${goalVal.toLocaleString()}. Be the first to support!</p>
          <small style="color:#6c8e86;">✨ posted on ${timeStr}</small>
        `;
        if (updatesContainer) {
          updatesContainer.insertBefore(newUpdate, updatesContainer.firstChild);
        }
        
        // reset form
        form.reset();
        showMessage(`✅ "${titleVal}" project created! It appears on top of projects & updates.`, true);
        
        // smooth scroll to projects to show new creation
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      // simple XSS prevention helper
      function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
          if (m === '&') return '&amp;';
          if (m === '<') return '&lt;';
          if (m === '>') return '&gt;';
          return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
          return c;
        });
      }
      
      // Login button mock interaction (graceful alert)
      const loginBtn = document.getElementById('loginMockBtn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          showMessage('🔐 Welcome back! (demo: crowdfunding experience ready)', true);
        });
      }
      
      // additional minor progress update: if any existing cards get dynamic new funding, ensure smooth toast messages
      // also ensure any future dynamic card's "Fund Project" logic is already covered using event delegation? but I attached during creation.
      // additional for safety: all .fund-btn existing (including dynamic) will be processed, but I already attached per new card.
      // Good to go.
    })();