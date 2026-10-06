Set-Location 'C:\Users\anubi\Desktop\kkinit'

# Feed tab images (Figma 18:553)
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-553-frame645.png' 'public\images\my\post-author.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-553-frame650.png' 'public\images\my\post-img1.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-553-frame651.png' 'public\images\my\post-img2.png' -Force

# Repost tab images (Figma 18:636)
New-Item -ItemType Directory -Force 'public\images\my\repost' | Out-Null
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame645.png' 'public\images\my\repost\kurumi-avatar.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame646.png' 'public\images\my\repost\dogidog-avatar.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame647.png' 'public\images\my\repost\johny-avatar.png' -Force

# Repost tab post images
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame649.png' 'public\images\my\repost\kurumi-1.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame650.png' 'public\images\my\repost\kurumi-2.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame651.png' 'public\images\my\repost\dogidog-1.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame652.png' 'public\images\my\repost\dogidog-2.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame653.png' 'public\images\my\repost\johny-1.png' -Force
Copy-Item 'app\assets\icons\my-figma-tmp2\fig-636-frame654.png' 'public\images\my\repost\johny-2.png' -Force

Remove-Item -Recurse -Force 'app\assets\icons\my-figma-tmp2'
Remove-Item -Force 'download-my-posts.ps1'
Write-Host 'done'